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

public class LoginSimulation extends Simulation {

  private HttpProtocolBuilder httpProtocol = http
      .baseUrl("http://wichat-en1b.francecentral.cloudapp.azure.com:3000")
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

  private Map<CharSequence, String> headers_13 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("Content-Type", "application/json"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("Priority", "u=0"));

  private Map<CharSequence, String> headers_14 = Map.ofEntries(
      Map.entry("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
      Map.entry("Priority", "u=0, i"),
      Map.entry("Upgrade-Insecure-Requests", "1"));

  private String uri1 = "wichat-en1b.francecentral.cloudapp.azure.com";

  private ScenarioBuilder scn = scenario("LoginSimulation")
      .exec(
          http("initial load")
              .get("/")
              .headers(headers_0)
              .resources(
                  http("get bundle.js")
                      .get("/static/js/main.02b5991e.js")
                      .headers(headers_1),
                  http("get css")
                      .get("/static/css/main.2a5e35aa.css")
                      .headers(headers_2),
                  http("get en.json")
                      .get("/locales/en.json")
                      .headers(headers_3),
                  http("get en-US.json")
                      .get("/locales/en-US.json")
                      .headers(headers_4),
                  http("options simplellm")
                      .options("http://" + uri1 + ":8000/simplellm")
                      .headers(headers_5),
                  http("post simplellm")
                      .post("http://" + uri1 + ":8000/simplellm")
                      .headers(headers_6)
                      .body(RawFileBody("io/gatling/demo/loginsimulation/0006_request.json"))),
          pause(1),
          http("go to login")
              .get("/login")
              .headers(headers_0)
              .resources(
                  http("get bundle.js")
                      .get("/static/js/main.02b5991e.js")
                      .headers(headers_1),
                  http("get css")
                      .get("/static/css/main.2a5e35aa.css")
                      .headers(headers_2),
                  http("get en.json")
                      .get("/locales/en.json")
                      .headers(headers_3),
                  http("get en-US.json")
                      .get("/locales/en-US.json")
                      .headers(headers_4)),
          pause(4),
          http("post login")
              .options("http://" + uri1 + ":8000/login")
              .headers(headers_5)
              .resources(
                  http("post login")
                      .post("http://" + uri1 + ":8000/login")
                      .headers(headers_13)
                      .body(RawFileBody("io/gatling/demo/loginsimulation/0013_request.json")),
                  http("get home")
                      .get("/home")
                      .headers(headers_14),
                  http("get bundle.js")
                      .get("/static/js/main.02b5991e.js")
                      .headers(headers_1),
                  http("get css")
                      .get("/static/css/main.2a5e35aa.css")
                      .headers(headers_2),
                  http("get en.json")
                      .get("/locales/en.json")
                      .headers(headers_3),
                  http("get en-US.json")
                      .get("/locales/en-US.json")
                      .headers(headers_4),
                  http("options simplellm")
                      .options("http://" + uri1 + ":8000/simplellm")
                      .headers(headers_5),
                  http("post simplellm")
                      .post("http://" + uri1 + ":8000/simplellm")
                      .headers(headers_6)
                      .body(RawFileBody("io/gatling/demo/loginsimulation/0020_request.json"))));

  {
    setUp(scn.injectOpen(constantUsersPerSec(10).during(60).randomized()))
        .protocols(httpProtocol);
  }
}
