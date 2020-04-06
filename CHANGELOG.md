# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Compressed app media
- Added 16:9 aspect ratio option to actions

### Removed
- Removed shadow from webstore icon



## [0.2.2] - 2019-07-30
### Fixed
- Fixed black background on favicon
- Fixed title bar not disappearing

### Changed
- Title bar appearance will no longer push webview down
- Changed icons to SVG sprite
- Improved behaviour of title bar

### Added
- Added option to fit webview when title bar appears
- Added option to pin title bar
- Added option to set the timeout of title bar disappearance

### Removed
- Removed permissions for audio, video and notification



## [0.2.1] - 2019-07-20
### Fixed
- Fixed a bug with windows opening at 0x0 pixels
- Fixed a bug with ENTER key not working when saving the URL

#### Changed
- Changed drag handle back to whole title bar due to bad UX

### Added
- Added support for mic and webcam use
- Added minimum window dimensions

### Removed
- Removed icon in settings window to switch to the browser since the browser is now always visible



## [0.2.0] - 2019-07-19
### Fixed
- Fixed weird behaviour of title bar
- Fixed default locale (now English)

### Changed
- Changed name integrally to Flobro for better recognition
- Reordered the settings window for better UX
- Browser window stays open when settings window is opened

### Added
- Added auto hide title bar
- Added URL validation

### Removed
- Removed keyboard shortcuts due to low usage



## [0.1.2] - 2018-04-06
### Fixed
- Fixed issue #7 - Browser window is now interactive
- Fixed a bug with non responsive F5 key to reload the webpage
- Fixed a bug that caused web window to be 20 x 20 pixels only

### Changed
- Changed the icons to better imply their meaning
- Minor improvements

### Added
- Added bar to move window with favicon and document title
- Added button to open settings/web window
- Added keyboard shortcuts legend
- Added credits

### Removed
- Removed the feature to show settings windows in fullscreen



## [0.1.1] - 2018-04-04
### Changed
- Updated icon



## 0.1.0 - 2016-09-29
### Added
- Initial release

[Unreleased]: https://github.com/cornips/flobro/compare/0.2.2...develop
[0.2.2]: https://github.com/cornips/flobro/compare/0.2.1...0.2.2
[0.2.1]: https://github.com/cornips/flobro/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/cornips/flobro/compare/0.1.2...0.2.0
[0.1.2]: https://github.com/cornips/flobro/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/cornips/flobro/compare/0.1.0...0.1.1
