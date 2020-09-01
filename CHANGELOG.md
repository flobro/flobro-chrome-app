# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.4] - 2020-09-01
### Fixed
- URL's incorrectly being marked as invalid
- Favicon does not show anything
- Minor typos in translation descriptions

### Changed
- Pin icon controls stay-on-top instead of title bar
- Title bar will now appear on every mouse enter

### Added
- Zoom controls
- Option to disable stay-on-top feature

### Removed
- Option to pin title bar
- Short name reference



## [0.2.3] - 2020-04-07
### Changed
- Compress app media
- Update Dutch and Polish translations

### Added
- Option to set 16:9 aspect ratio

### Removed
- Remove shadow from webstore icon
- Remove fullscreen permission to allow fullscreen within Flobro window



## [0.2.2] - 2019-07-30
### Fixed
- Favicon has a black background
- Title bar not disappearing

### Changed
- Title bar appearance will no longer push webview down
- Changed separate icons to SVG sprite
- Improved behaviour of title bar

### Added
- Option to fit webview when title bar appears
- Option to pin title bar
- Option to set the timeout of title bar disappearance

### Removed
- Asking permissions for audio, video and notification
- Support for microphone and webcam use



## [0.2.1] - 2019-07-20
### Fixed
- Windows opening at 0x0 pixels
- ENTER key not working when saving the URL

#### Changed
- Set drag handle back to whole title bar due to bad UX

### Added
- Support for microphone and webcam use
- Minimum window dimensions

### Removed
- Switch-to-browser icon since the browser is now always visible



## [0.2.0] - 2019-07-19
### Fixed
- Weird behaviour of title bar

### Changed
- Default locale is now English instead of Dutch
- Use Flobro as name for better recognition
- Reorder the settings window for better UX
- Browser window stays open when settings window is opened

### Added
- Auto hide title bar
- URL validation

### Removed
- Support for keyboard shortcuts due to low usage



## [0.1.2] - 2018-04-06
### Fixed
- Browser window is now interactive, fixing #7
- Non responsive F5 key to reload the webpage
- Bug causing web window to be 20 x 20 pixels only

### Changed
- Use other icons to better imply their meaning
- Minor improvements

### Added
- Bar to move window with favicon and document title
- Button to open settings/web window
- Keyboard shortcuts legend
- Credits

### Removed
- Fullscreen option for settings window



## [0.1.1] - 2018-04-04
### Changed
- Icon



## 0.1.0 - 2016-09-29
### Added
- Initial release

[Unreleased]: https://github.com/cornips/flobro/compare/0.2.3...develop
[0.2.3]: https://github.com/cornips/flobro/compare/0.2.2...0.2.3
[0.2.2]: https://github.com/cornips/flobro/compare/0.2.1...0.2.2
[0.2.1]: https://github.com/cornips/flobro/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/cornips/flobro/compare/0.1.2...0.2.0
[0.1.2]: https://github.com/cornips/flobro/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/cornips/flobro/compare/0.1.0...0.1.1
