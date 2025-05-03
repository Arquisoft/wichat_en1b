package io.gatling.demo;

import java.util.Map;

import static io.gatling.javaapi.core.CoreDsl.constantUsersPerSec;
import static io.gatling.javaapi.core.CoreDsl.pause;
import static io.gatling.javaapi.core.CoreDsl.scenario;
import io.gatling.javaapi.core.ScenarioBuilder;
import io.gatling.javaapi.core.Simulation;
import static io.gatling.javaapi.http.HttpDsl.http;
import io.gatling.javaapi.http.HttpProtocolBuilder;

public class QODSimulation extends Simulation {

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
      Map.entry("Access-Control-Request-Headers", "authorization"),
      Map.entry("Access-Control-Request-Method", "GET"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("Priority", "u=4"));

  private Map<CharSequence, String> headers_6 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"31d-S+b1e/VZQD1/dInzXiaRXkdcLIE\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("Priority", "u=0"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTk3MjUsImV4cCI6MTc0NjIyMzMyNX0.81p4eAd-5S-VxyXcOVnq3jOWUPunlP8WooRMw5Ij6YQ"));

  private String uri1 = "wichat-en1b.francecentral.cloudapp.azure.com";

  private ScenarioBuilder scn = scenario("QODSimulation")
      .exec(
          http("get game-modes")
              .get("/game-modes")
              .headers(headers_0)
              .resources(
                  http("get static/js/main.02b5991e.js")
                      .get("/static/js/main.02b5991e.js")
                      .headers(headers_1),
                  http("get static/css/main.2a5e35aa.css")
                      .get("/static/css/main.2a5e35aa.css")
                      .headers(headers_2),
                  http("get locales/en.json")
                      .get("/locales/en.json")
                      .headers(headers_3),
                  http("get locales/en-US.json")
                      .get("/locales/en-US.json")
                      .headers(headers_4)),
          pause(1),
          http("options question-of-the-day")
              .options("http://" + uri1 + ":8000/question-of-the-day")
              .headers(headers_5)
              .resources(
                  http("get question-of-the-day")
                      .get("http://" + uri1 + ":8000/question-of-the-day")
                      .headers(headers_6)));

  {
    setUp(scn.injectOpen(constantUsersPerSec(25).during(30).randomized()))
        .protocols(httpProtocol);
  }
}
