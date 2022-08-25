## For Devs

In this document, we talk about the different technical considerations we've taken to help realise the Elsa for CTC system.

The general gist;

> We use the technology that makes use get the answers as quick as possible

The TLDR; from the architectural considerations in the **Elsa for CTC**, here are the pieces to build were:

-   The Storage Module
-   The Mobile Application
-   The Server

### 1. Storage module

This storage component is implementation to work adaptively over a custom storage implementation (like redis or async-storage for mobile). The implementation is done with [Typescript](https://typescriptlang.org) and using the concepts learned from [CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)

### 2. Mobile Application

Technology Stack:

-   React using React Native w/ Typescript - [`react-native`](https://reactnative.dev/)
-   [`WebSocket`](https://reactnative.dev/docs/network#websocket-support)
-   Storage module w/ AsyncStorage - [`papai`](https://github.com/iam-kevin/papai) + [`@react-native-async-storage/async-storage`](https://github.com/react-native-async-storage/async-storage)
-   Codepush - [`react-native-code-push`](https://github.com/microsoft/react-native-code-push)

### 3. Server

Technology Stack:

-   ExpressJS using Typescript - [`express`](https://expressjs.com/)
-   Websocket for node - [`ws`](https://github.com/websockets/ws)
-   Storage module w/ LevelDB - [`papai`](https://github.com/iam-kevin/papai) + [`level`](https://github.com/Level/level)
