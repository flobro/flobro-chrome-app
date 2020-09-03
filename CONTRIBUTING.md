# Contributing to Flobro

Thank you for your interest in contributing to Flobro! From commenting on and triaging issues, to reviewing and sending Pull Requests, all contributions are welcome.

The [Open Source Guides](https://opensource.guide/) website has a collection of resources for individuals, communities, and companies who want to learn how to run and contribute to an open source project. Contributors and people new to open source alike will find the following guides especially useful:

* [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
* [Building Welcoming Communities](https://opensource.guide/building-community/)


### [Code of Conduct][code-of-conduct]
[code-of-conduct]: https://github.com/flobro/flobro-chrome-app/blob/master/CODE_OF_CONDUCT.md

As a reminder, all contributors are expected to adhere to the [Code of Conduct][code-of-conduct].

## Ways to Contribute

If you are eager to start contributing code right away, we have a list of [good first issues](https://github.com/flobro/flobro-chrome-app/labels/good%20first%20issue) that contain bugs which have a relatively limited scope.

There are other ways you can contribute without writing a single line of code. Here are a few things you can do to help out:

1. **Replying and handling open issues.** Some of the issues we get may lack necessary information. You can help out by guiding people through the process of filling out the issue template, asking for clarifying information, or pointing them to existing issues that match their description of the problem.
2. **Reviewing pull requests for the docs.** Reviewing [documentation updates](https://github.com/flobro/flobro-website/pulls) can be as simple as checking for spelling and grammar. If you encounter situations that can be explained better in the docs, click **Edit** at the top of most docs pages to get started with your own contribution.
3. **Help people write test plans.** Some pull requests sent to the main repository may lack a proper test plan. These help reviewers understand how the change was tested, and can speed up the time it takes for a contribution to be accepted.

Each of these tasks is highly impactful, and maintainers will greatly appreciate your help.

### Our Development Process

We use GitHub issues and pull requests to keep track of bug reports and contributions from the community.

### Repositories

The main repository, <https://github.com/flobro/flobro-chrome-app>, contains the Flobro app itself and it is here where we keep track of bug reports and manage pull requests.

There are a few other repositories you might want to familiarize yourself with:

* **Flobro website** which contains the source code for the website, including the documentation, located at <https://github.com/flobro/flobro-website>

Browsing through these repositories should provide some insight into how the Flobro open source project is managed.

## Helping with Documentation

The Flobro documentation is hosted as part of the Flobro website repository at <https://github.com/flobro/flobro-website>. The website itself is located at <https://flobro.app/> and it is built using [Docusaurus](https://docusaurus.io/). If there's anything you'd like to change in the docs, you can get started by clicking on the "Edit" button located on the upper right of most pages in the website.

If you are adding new functionality or introducing a change in behavior, we will ask you to update the documentation to reflect your changes.

## Contributing Code

Code-level contributions to Flobro generally come in the form of [pull requests](https://help.github.com/en/articles/about-pull-requests). These are done by forking the repo and making changes locally.

The process of proposing a change to Flobro can be summarized as follows:

1. Fork the Flobro repository and create your branch from `develop`.
2. Make the desired changes to Flobro sources. Test with Chrome [running in Developer mode](https://developer.chrome.com/extensions/faq#:~:text=You%20can%20start%20by%20turning,a%20packaged%20extension%2C%20and%20more.).
3. If you've added code that should be tested, add tests.
4. If applicable, update the documentation, which lives in [another repo](https://github.com/flobro/flobro-website).
5. Ensure the test suite passes, either locally or on CI once you opened a pull request.
6. Make sure your code lints (for example via `yarn lint --fix`).
7. Push the changes to your fork.
8. Create a pull request to the Flobro repository.
9. Review and address comments on your pull request.
    1. A bot may comment with suggestions. Generally we ask you to resolve these first before a maintainer will review your code.

If all goes well, your pull request will be merged. If it is not merged, maintainers will do their best to explain the reason why.

### Tests

Tests help us prevent regressions from being introduced to the codebase. The GitHub repository is continuously tested using Circle and Appveyor, the results of which are available through the Checks functionality on [commits](https://github.com/flobro/flobro-chrome-app/commits/master) and pull requests.

## Sharing the love

You can help others by sharing your experience with Flobro, whether that is through blog posts, presenting talks at conferences, or simply sharing your thoughts on social media.

If you need any assets in the form of a press kit, please visit [our website](https://flobro.app/).
