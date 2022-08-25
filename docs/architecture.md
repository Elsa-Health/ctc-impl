## Architecture

## Known Knowns

The elements that are included in the application

-   Health Care Providers (Doctors and Community Health Care Workers) - These are the intended users (clients) of the Elsa for CTC
-   Patients, ideally PLWA - These are the intended beneficiaries of th platform
-   Stakeholders - These are the people who are interested to know what's going on in the system

When architecting the solution for the _Elsa for CTC_, we have used the experimentations learned from earlier development and we know the following.

-   Distribution of the technical literacy of the users - Low to Mid (More skewed on Low)
-   Internet access to the client users are present on average 1 in 7 days (They are _online_ a few times)
-   Patients sometimes show up to different health care providers (not of their registration)

Knowing this, we've come up with some system structure and components to build to work in these conditions.

## System Structure

Know the above, and the resources we have at our disposal, we've gone have the following elements in the system:

-   Client Interface / Mobile Application - Tool that the health care providers would use to interact with the system. This application, through the transport layer, receives messages received from
-   "Convenience" server - Backend that choerographs the messages received from the connected client devices and sends the updated information appropriately
-   Transport Layer - This layer is used as a medium of routing the messages between the devices and the server

### 1. Client Interface / Mobile Application [Main Entry]

The main entry point expected by the intended users to interact with the system.

With this, the users (Health Care Providers) would make the needed operations and deliver the needed services throught the applications to its beneficiaries (PLWA)

Some of the feature set include:

-   Should ALWAYS works offline
-   Search for the patients with in the system
-   Register patient and Update Records in their systems
-   Attend to a patient visit
-   Request and attend lab tests / investigation to patients
-   Log administration of medication given to patients
-   See stock information on other registered facilities
-   Transfer patients to a different registered facilities

From these above features, most often the actions needed relay on:

-   Offline first
-   Share information with other devices (any reads / writes to data stored in the network)
-   Simple UI design of the application

With this, we've made the following considerations.

#### Application Structure

This application now consists of 4 parts, each with it's own responsiblities:

![[client-device-archi]](/resources/architecture.png)

1. **Application Interface** - part of the application to receive interactions (actions) from the user, and invokes certain executions needed. The interface would also change content of the applcition like the list of patients and status of visit.
2. **Storage module** - module that stores the infomation that is local to use of the application by the user. This includes information, to name a few,
    1. Patient files,
    2. patient's visits,
    3. Medication requests and dispense information
    4. Lab test requests and reports
3. **Messages storage module** - contains messages that are to facilite reconsiliation of the data that's distributed across the devices. Closes meaning to this will be the CRDT messages
4. **Logic / Controller Layer** - handles the execution of application logic for things like `registerNewPatient`, `transferPatient`, choreography that updates the local stored data from messages received from external devices. Contains logic that mutates the data on the storage.

### 2. Server

![[server]](/resources/basic-layout.png)

This piece is useful for 2 main reasons:

1. **Message forwarding to connected devices** - The concerned devices are the client users and the server that share the information needed to replicate the data on the the devices locally.

2. **Serving to the interested consumers** - intended consumers are apps needed to generate analytics and reporting like a dashboard website, or anyother intended users.

### 3. Transport Layer

There are 2 used transport layers

-   Websocket - used in the client devices and the server to facilitate the routing of messages for updating the state of the devices.
-   HTTP - used by the server to serve data to intereset clients to reasons like analytics and other such reasons
