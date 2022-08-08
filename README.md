![ELSA HEALTH](https://www.elsa.health/elsa-logo.png)

# Elsa Health CTC Project

[Badge]

This project created to: \*\* create useful digital CTC network

This repo has 3 parts

-   Mobile CTC
-   Server
-   Emr

<img src="/resources/basic-layout.svg" />

## Getting Started

Project was bootstrapped with `turborepo`, meaning most of the interactions with the rest of the project would be more close to a `yarn` workspaces

### Installation

When cloning the project from this point, it shouldn't also automatically pull the repositories from the submodules as well (i.e project [emr](https://github.com/Elsa-Health/emr-impl) and [server](https://github.com/Elsa-Health/dacc-server-impl))

From that point, start by installing project dependencies

```bash
yarn
```

### Development

#### App

To launch the mobile application for development, make sure your device is plugged in or your are running an emulator, then run:

```bash
yarn w mobile-ctc android
```

Then followed by

```bash
yarn w mobile-ctc start
```

#### EMR

If you plan on making **development** on the EMR and have changes apply to the app, open a new terminal then run

```bash
yarn w @elsa-health/emr dev
```

With fast reloading on, frequest updates on the [`/packages/emr`](./packages/emr/) project might throw a `missing package` or `haste package related` error. You might want to instead to want to perform manual periodic builds yourself. To do that.

```bash
yarn w @elsa-health/emr build
```

#### Dacc Server

When working on the Dacc server project as part of this repository (as opposed to individual development), Run

```bash
yarn w dacc-server dev
```

By default, this will expose a socket endpoint via port `5005`, to override, run

```bash
PORT=5678 yarn w dacc-server dev
```

To quickly be able to have the dacc-server properly communicate with the mobile application, you might want to forward the connection using something like [ngrok](https://ngrok.com/)

## Contributing

We love Open Source, appreciate contibutions from developers all around. See `CONTRIBUTING.md` for ways to get started.

Please adhere to this project's `CODE_OF_CONDUCT.md`.

## Feedback

If you have any feedback, please share it in the Discussions
using the `feedback` label or reach us out at info@elsa.health
