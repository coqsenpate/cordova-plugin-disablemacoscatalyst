'use strict'

const path = require('path')
const fs = require('fs')

const xcodeprojRegex = /\.xcodeproj$/
const CATALYST_ENABLED_STRING = 'SUPPORTS_MACCATALYST = YES'
const CATALYST_DISABLED_STRING = 'SUPPORTS_MACCATALYST = NO'

function findXcodeprojPath(iosPlatformPath) {
	const files = fs.readdirSync(iosPlatformPath)
	const xcodeprojName = files.find((filename)=> {
		return xcodeprojRegex.test(filename)
	})

	if (!xcodeprojName)
		throw new Error('Unable to find XCode project folder.')

	return path.join(iosPlatformPath,xcodeprojName)
}

module.exports = (context)=> {
	try {
		if (!context.opts.platforms.includes('ios')) {
			// Ios platform not present, doing nothing.
			return
		}

		const platformFolder = path.join(context.opts.projectRoot,'platforms/ios')
		const projectFolder = findXcodeprojPath(platformFolder)
		const pbxprojPath = path.join(projectFolder,'project.pbxproj')

		const pbxprojContent = fs.readFileSync(pbxprojPath,{encoding:'utf8'})
		const modifiedContent = pbxprojContent.replaceAll(CATALYST_ENABLED_STRING,CATALYST_DISABLED_STRING)

		if (pbxprojContent != modifiedContent) {
			// only write file if there was a change
			fs.writeFileSync(pbxprojPath,modifiedContent)
			// console.log('Mac catalyst disabled.')
		}
	} catch(error) {
		console.error(`[${context.opts.plugin.id}]: ${error.message}`)
		process.exit(1)
	}
}
