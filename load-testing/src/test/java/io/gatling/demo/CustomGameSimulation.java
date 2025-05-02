package io.gatling.demo;

import java.util.Map;

import static io.gatling.javaapi.core.CoreDsl.RawFileBody;
import static io.gatling.javaapi.core.CoreDsl.constantUsersPerSec;
import static io.gatling.javaapi.core.CoreDsl.pause;
import static io.gatling.javaapi.core.CoreDsl.scenario;
import io.gatling.javaapi.core.ScenarioBuilder;
import io.gatling.javaapi.core.Simulation;
import static io.gatling.javaapi.http.HttpDsl.http;
import io.gatling.javaapi.http.HttpProtocolBuilder;

public class CustomGameSimulation extends Simulation {

  private HttpProtocolBuilder httpProtocol = http
      .baseUrl("http://wichat-en1b.francecentral.cloudapp.azure.com:8000")
      .inferHtmlResources()
      .acceptHeader("*/*")
      .acceptEncodingHeader("gzip, deflate")
      .acceptLanguageHeader("en-US,en;q=0.5")
      .userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0");

  private Map<CharSequence, String> headers_0 = Map.ofEntries(
      Map.entry("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
      Map.entry("If-None-Match", "\"27e0fe43423fe8f486221b8073178dcdd204d856\""),
      Map.entry("Priority", "u=0, i"),
      Map.entry("Upgrade-Insecure-Requests", "1"));

  private Map<CharSequence, String> headers_1 = Map.of("If-None-Match", "\"1e92a1607c1fd5159866d11e2c588a82075acbfe\"");

  private Map<CharSequence, String> headers_2 = Map.ofEntries(
      Map.entry("Accept", "text/css,*/*;q=0.1"),
      Map.entry("If-None-Match", "\"afc8680c0758c55f06b88b37f9e91c82caf3d032\""),
      Map.entry("Priority", "u=2"));

  private Map<CharSequence, String> headers_3 = Map.ofEntries(
      Map.entry("If-None-Match", "\"b3450116561cbc11633ff061af660c367d50ba06\""),
      Map.entry("Priority", "u=4"));

  private Map<CharSequence, String> headers_4 = Map.ofEntries(
      Map.entry("If-None-Match", "\"27e0fe43423fe8f486221b8073178dcdd204d856\""),
      Map.entry("Priority", "u=4"));

  private Map<CharSequence, String> headers_5 = Map.ofEntries(
      Map.entry("Access-Control-Request-Headers", "content-type"),
      Map.entry("Access-Control-Request-Method", "POST"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("Priority", "u=4"));

  private Map<CharSequence, String> headers_6 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("Content-Type", "application/json"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"));

  private Map<CharSequence, String> headers_12 = Map.ofEntries(
      Map.entry("Cache-Control", "no-cache"),
      Map.entry("Content-Type", "application/ocsp-request"),
      Map.entry("Pragma", "no-cache"),
      Map.entry("Priority", "u=2"));

  private Map<CharSequence, String> headers_26 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("Content-Type", "application/json"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("Priority", "u=0"));

  private Map<CharSequence, String> headers_35 = Map.ofEntries(
      Map.entry("Access-Control-Request-Headers", "authorization"),
      Map.entry("Access-Control-Request-Method", "GET"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("Priority", "u=4"));

  private Map<CharSequence, String> headers_36 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("Priority", "u=0"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_37 = Map.ofEntries(
      Map.entry("Access-Control-Request-Headers", "authorization,content-type"),
      Map.entry("Access-Control-Request-Method", "POST"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("Priority", "u=4"));

  private Map<CharSequence, String> headers_38 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("Content-Type", "application/json"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("Priority", "u=0"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_39 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"1db-IKKydXgq5lW5kO4Gh1LdbTVQF5o\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_45 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"285-uXRGO9NuKudHa4C7P2gKvHWE8/I\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_51 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"204-eHASZ4I3VxpSydOKYF91JeXTQZ4\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_53 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"1dd-hk8WJvQ3V6lR9ZrWbx2eXg4i+VE\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_57 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"1d2-6vT8ltNuqd30Q99W0Nq9PQ1P/ww\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_59 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"1c4-cZ1XG57WQG6WBL69PB1+bZk7+cw\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_63 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"22f-kbrGlzGAUSu7V6qhrSP5w7gSA7Y\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_65 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"1fd-P5sUrp7Hlij0X3UF67LAFNjjtSg\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_71 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"210-jMgmmZJ42r9+rJ1ZMTrBcaNyadM\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_73 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"1bc-oz4690HhFVc7ynHeaKHvFBMqIhY\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_77 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"1bf-tUyZdgjCTITvJRy3JdM/sd0GBG0\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_79 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"1b6-HBaf0oO1QLNdcrUKbGpdmPVY/3w\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private Map<CharSequence, String> headers_83 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("Content-Type", "application/json"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTg2NTcsImV4cCI6MTc0NjIyMjI1N30.2IFvsDR9ti8DWDmD4n010Q2LqzXt53rB4VS2A_O9Hxk"));

  private String uri1 = "http://r10.o.lencr.org";

  private String uri2 = "http://r11.o.lencr.org";

  private String uri3 = "http://o.pki.goog/wr2";

  private String uri4 = "wichat-en1b.francecentral.cloudapp.azure.com";

  private ScenarioBuilder scn = scenario("CustomGameSimulation")
      .exec(
          http("initial load")
              .get("http://" + uri4 + ":3000/")
              .headers(headers_0)
              .resources(
                  http("get bundle.js")
                      .get("http://" + uri4 + ":3000/static/js/main.02b5991e.js")
                      .headers(headers_1),
                  http("get css")
                      .get("http://" + uri4 + ":3000/static/css/main.2a5e35aa.css")
                      .headers(headers_2),
                  http("get en.json")
                      .get("http://" + uri4 + ":3000/locales/en.json")
                      .headers(headers_3),
                  http("get en-US.json")
                      .get("http://" + uri4 + ":3000/locales/en-US.json")
                      .headers(headers_4),
                  http("options simplellm")
                      .options("/simplellm")
                      .headers(headers_5),
                  http("post simplellm")
                      .post("/simplellm")
                      .headers(headers_6)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0006_request.json")),
                  http("go to login")
                      .get("http://" + uri4 + ":3000/login")
                      .headers(headers_0),
                  http("get bundle.js")
                      .get("http://" + uri4 + ":3000/static/js/main.02b5991e.js")
                      .headers(headers_1),
                  http("get css")
                      .get("http://" + uri4 + ":3000/static/css/main.2a5e35aa.css")
                      .headers(headers_2),
                  http("get en.json")
                      .get("http://" + uri4 + ":3000/locales/en.json")
                      .headers(headers_3),
                  http("get en-US.json")
                      .get("http://" + uri4 + ":3000/locales/en-US.json")
                      .headers(headers_4)),
          pause(5),
          http("go to custom game")
              .post(uri1 + "/")
              .headers(headers_12)
              .body(RawFileBody("io/gatling/demo/customgamesimulation/0012_request.dat"))
              .resources(
                  http("post custom game")
                      .post(uri1 + "/")
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0013_request.dat")),
                  http("post custom game")
                      .post(uri1 + "/")
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0014_request.dat")),
                  http("post custom game")
                      .post(uri1 + "/")
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0015_request.dat")),
                  http("post custom game")
                      .post(uri1 + "/")
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0016_request.dat")),
                  http("post custom game")
                      .post(uri1 + "/")
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0017_request.dat")),
                  http("post custom game")
                      .post(uri1 + "/")
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0018_request.dat")),
                  http("post custom game")
                      .post(uri1 + "/")
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0019_request.dat")),
                  http("post custom game")
                      .post(uri1 + "/")
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0020_request.dat")),
                  http("post custom game")
                      .post(uri3)
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0021_request.dat")),
                  http("post custom game")
                      .post(uri3)
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0022_request.dat")),
                  http("post custom game")
                      .post(uri2 + "/")
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0023_request.dat")),
                  http("post custom game")
                      .post(uri2 + "/")
                      .headers(headers_12)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0024_request.dat")),
                  http("go to login")
                      .options("/login")
                      .headers(headers_5),
                  http("post login")
                      .post("/login")
                      .headers(headers_26)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0026_request.json")),
                  http("options simplellm")
                      .options("/simplellm")
                      .headers(headers_5),
                  http("get home")
                      .get("http://" + uri4 + ":3000/home")
                      .headers(headers_0),
                  http("get bundle.js")
                      .get("http://" + uri4 + ":3000/static/js/main.02b5991e.js")
                      .headers(headers_1),
                  http("get css")
                      .get("http://" + uri4 + ":3000/static/css/main.2a5e35aa.css")
                      .headers(headers_2),
                  http("get en.json")
                      .get("http://" + uri4 + ":3000/locales/en.json")
                      .headers(headers_3),
                  http("get en-US.json")
                      .get("http://" + uri4 + ":3000/locales/en-US.json")
                      .headers(headers_4),
                  http("options simplellm")
                      .options("/simplellm")
                      .headers(headers_5),
                  http("post simplellm")
                      .post("/simplellm")
                      .headers(headers_6)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0034_request.json"))),
          pause(5),
          http("options question random")
              .options("/question/random")
              .headers(headers_35)
              .resources(
                  http("get question random")
                      .get("/question/random")
                      .headers(headers_36)),
          pause(2),
          http("options answer")
              .options("/answer")
              .headers(headers_37)
              .resources(
                  http("post answer")
                      .post("/answer")
                      .headers(headers_38)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0038_request.json"))),
          pause(2),
          http("get question random")
              .get("/question/random")
              .headers(headers_39),
          pause(4),
          http("options askllm")
              .options("/askllm")
              .headers(headers_5)
              .resources(
                  http("post askllm")
                      .post("/askllm")
                      .headers(headers_26)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0041_request.json"))),
          pause(1),
          http("options answer")
              .options("/answer")
              .headers(headers_37)
              .resources(
                  http("post answer")
                      .post("/answer")
                      .headers(headers_38)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0043_request.json"))),
          pause(2),
          http("options question random")
              .options("/question/random")
              .headers(headers_35)
              .resources(
                  http("get question random")
                      .get("/question/random")
                      .headers(headers_45)),
          pause(2),
          http("options askllm")
              .options("/askllm")
              .headers(headers_5)
              .resources(
                  http("post askllm")
                      .post("/askllm")
                      .headers(headers_26)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0047_request.json"))),
          pause(2),
          http("options answer")
              .options("/answer")
              .headers(headers_37)
              .resources(
                  http("post answer")
                      .post("/answer")
                      .headers(headers_38)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0049_request.json"))),
          pause(2),
          http("options question random")
              .options("/question/random")
              .headers(headers_35)
              .resources(
                  http("get question random")
                      .get("/question/random")
                      .headers(headers_51)),
          pause(1),
          http("post answer")
              .post("/answer")
              .headers(headers_38)
              .body(RawFileBody("io/gatling/demo/customgamesimulation/0052_request.json")),
          pause(2),
          http("get question random")
              .get("/question/random")
              .headers(headers_53),
          pause(2),
          http("options answer")
              .options("/answer")
              .headers(headers_37)
              .resources(
                  http("post answer")
                      .post("/answer")
                      .headers(headers_38)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0055_request.json"))),
          pause(2),
          http("options question random")
              .options("/question/random")
              .headers(headers_35)
              .resources(
                  http("get question random")
                      .get("/question/random")
                      .headers(headers_57)),
          pause(1),
          http("post answer")
              .post("/answer")
              .headers(headers_38)
              .body(RawFileBody("io/gatling/demo/customgamesimulation/0058_request.json")),
          pause(2),
          http("get question random")
              .get("/question/random")
              .headers(headers_59),
          pause(1),
          http("options answer")
              .options("/answer")
              .headers(headers_37)
              .resources(
                  http("post answer")
                      .post("/answer")
                      .headers(headers_38)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0061_request.json"))),
          pause(2),
          http("options question random")
              .options("/question/random")
              .headers(headers_35)
              .resources(
                  http("get question random")
                      .get("/question/random")
                      .headers(headers_63)),
          pause(1),
          http("post answer")
              .post("/answer")
              .headers(headers_38)
              .body(RawFileBody("io/gatling/demo/customgamesimulation/0064_request.json")),
          pause(2),
          http("get question random")
              .get("/question/random")
              .headers(headers_65),
          pause(2),
          http("options askllm")
              .options("/askllm")
              .headers(headers_5)
              .resources(
                  http("post askllm")
                      .post("/askllm")
                      .headers(headers_26)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0067_request.json")),
                  http("options answer")
                      .options("/answer")
                      .headers(headers_37),
                  http("post answer")
                      .post("/answer")
                      .headers(headers_38)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0069_request.json"))),
          pause(2),
          http("options question random")
              .options("/question/random")
              .headers(headers_35)
              .resources(
                  http("get question random")
                      .get("/question/random")
                      .headers(headers_71)),
          pause(1),
          http("post answer")
              .post("/answer")
              .headers(headers_38)
              .body(RawFileBody("io/gatling/demo/customgamesimulation/0072_request.json")),
          pause(2),
          http("get question random")
              .get("/question/random")
              .headers(headers_73),
          pause(2),
          http("options answer")
              .options("/answer")
              .headers(headers_37)
              .resources(
                  http("post answer")
                      .post("/answer")
                      .headers(headers_38)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0075_request.json"))),
          pause(2),
          http("options question random")
              .options("/question/random")
              .headers(headers_35)
              .resources(
                  http("get question random")
                      .get("/question/random")
                      .headers(headers_77)),
          pause(1),
          http("post answer")
              .post("/answer")
              .headers(headers_38)
              .body(RawFileBody("io/gatling/demo/customgamesimulation/0078_request.json")),
          pause(2),
          http("get question random")
              .get("/question/random")
              .headers(headers_79),
          pause(1),
          http("options answer")
              .options("/answer")
              .headers(headers_37)
              .resources(
                  http("post answer")
                      .post("/answer")
                      .headers(headers_38)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0081_request.json")),
                  http("options recordGame")
                      .options("/recordGame")
                      .headers(headers_37),
                  http("post recordGame")
                      .post("/recordGame")
                      .headers(headers_83)
                      .body(RawFileBody("io/gatling/demo/customgamesimulation/0083_request.json"))));

  {
    setUp(scn.injectOpen(constantUsersPerSec(4).during(30).randomized()))
        .protocols(httpProtocol);
  }
}
