# Java Gatling project to do load testing

A simple Maven project to facilitate load testing with gatling.
Check the [Gatling website](https://docs.gatling.io/reference/integrations/build-tools/maven-plugin/) for documentation.

It includes:

- [Maven Wrapper](https://maven.apache.org/wrapper/), so that you can immediately run Maven with `./mvnw` without having
  to install it on your computer
- minimal `pom.xml`
- latest version of `io.gatling:gatling-maven-plugin` applied
- proper source file layout

### Running the tests

To run load test and generate the graphical reports.
The results will be found in (`target/gatling`)

```shell
mvnw gatling:test
```

### Open Recorder

With this command you will be able to open the GUI recorder.
The recorder highly eases the creation of new test cases.

```shell
mvnw gatling:recorder
```

To properly configure the recorder we have to follow these steps:

1. Configure the recorder in **HTTP proxy mode**.
2. Configure the **HTTPs mode** to Certificate Authority.
3. Generate a **CA certificate** and key. For this, press the Generate CA button. You will have to choose a folder to generate the certificates. Two pem files will be generated.
4. Configure Firefox to use this **CA certificate** (Preferences>Certificates, import the generated certificate).
5. Configure Firefox to use a **proxy** (Preferences>Network configuration). The proxy will be localhost:8000.
6. Configure Firefox so it uses this proxy even if the call is to a local address. In order to do this, we need to set the property `network.proxy.allow_hijacking_localhost` to `true` in `about:config`.
