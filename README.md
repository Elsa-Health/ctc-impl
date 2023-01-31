![ELSA HEALTH](https://www.elsa.health/elsa-logo.png)

**Elsa for CTC** is a project combining different tools and programs choerographed to improve the effectiveness of Health Care providers to take care of PLWA, all the while embracing digital systems.

Things we care about:

-   Simple interfacing of personnel to the system
-   Lowering barrier of entry in tech for health

## About

This repository contains the documents and source code that talk about the system responsible for creating the Elsa for CTC Project. This README is intented to brush over the key things to look for within the repository.

The different elements that make up the project include:

-   A Mobile Application
-   A Synchronization Server
-   And a EMR Storage module
-   Dashboard System

An in-depth explanation for this can be found [here](docs/architecture.md). But in the meantime, here's a photo showing the basic structure of the system

![[basic-layout]](/resources/basic-layout-0.png)

## Documentation

Most of the introductory information about the Elsa for CTC can be found in this README.

But when higlighting more specific information, you might want to check out the other linked documents below:

-   [About - The What, Why?](docs/about.md)
-   [Architecture (L1, L2, L3)](docs/architecture.md)
-   [For Developers](docs/for_developers.md)

## Getting Started

### Project Requirements

To be able to build the project on your successfully on your end. You'll need:

-   [NodeJS](https://nodejs.org/en/download/) (at least v14, preferable [LTS](https://nodejs.org/en/about/releases/#:~:text=LTS%20release%20status%20is%20%22long,Release))
-   [yarn](https://classic.yarnpkg.com/lang/en/docs/install/) (at least v1.22.14) - This is important as the project monorepo was made for yarn. (npm, or pnpm might not work)
-   [OpenJDK 11](https://adoptium.net/temurin/releases/?version=11) (or any A Java Development Kit and Runtime)
-   [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools)

\*If you'd want to development on top of what currently exists. You might to also include:

-   Emulator application ([Android Studio](https://developer.android.com/studio) or [Genymotion](https://www.genymotion.com/))
-   A code editor of your choice ([VSCode](https://code.visualstudio.com/) is great!)

### Installation

1. After `git` cloning this project. Make sure to import the content of the submoules using:

    ```bash
    git submodule update --init --recursive
    ```

2. After acquiring the above requirements, and make the appropriate configurations for each application (like setting `export ANDROID_SDK_ROOT=`), navigate to the project folder throught the terminal and install the project by running:

    ```bash
    yarn install
    yarn build
    ```

3. We are using a firebase project to store information over there. So you should include your own `google-service.json` in the `mobile-ctc/android/app`.

### Structure

The project is a [Mono-repository (monorepo)](https://en.wikipedia.org/wiki/Monorepo) created with [Turborepo](https://turborepo.org/). Making it easier to house and work with the different building blocks that make up the entire project.

The project is split into 3 repositories:

-   [`mobile-ctc`](/apps/mobile-ctc) - The main repository housing the mobile application that is used by the health care providers to interact with the system
-   [`dacc-server`](/apps/dacc-server)- The repository housing the server that is used to sync the data between different `mobile-ctc` applications
-   [`@elsa-health/emr`](packages/emr) - The repository housing the module that is used to business and storage logic for the `mobile-ctc` applications as well as the housing types that used across the projects / repositories (e.g. [`Patient`](/packages/emr/health.types/v1/personnel.d.ts#L15), [`MedicationRequest`](/packages/emr/health.types/v1/prescription.d.ts#L12), [`Visit`](/packages/emr/health.types/v1/visit.d.ts#L7) types)

To be able to make contributions to the different parts of the project you need to make use of the workspace commands made available by the packages
manager (in our case, `yarn`) and make the installations accordingly.

So to work with the `mobile-ctc` application you'll need to run:

```bash
yarn workspace mobile-ctc android
```

More on using workspace related commands see [Yarn workspaces](https://classic.yarnpkg.com/en/docs/cli/workspace)
