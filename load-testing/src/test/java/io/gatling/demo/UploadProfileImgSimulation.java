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

public class UploadProfileImgSimulation extends Simulation {

  private HttpProtocolBuilder httpProtocol = http
      .baseUrl("http://wichat-en1b.francecentral.cloudapp.azure.com:8000")
      .inferHtmlResources()
      .acceptHeader("image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5")
      .acceptEncodingHeader("gzip, deflate")
      .acceptLanguageHeader("en-US,en;q=0.5")
      .userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0");

  private Map<CharSequence, String> headers_0 = Map.ofEntries(
      Map.entry("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
      Map.entry("If-None-Match", "\"27e0fe43423fe8f486221b8073178dcdd204d856\""),
      Map.entry("Priority", "u=0, i"),
      Map.entry("Upgrade-Insecure-Requests", "1"));

  private Map<CharSequence, String> headers_1 = Map.ofEntries(
      Map.entry("Accept", "*/*"),
      Map.entry("If-None-Match", "\"1e92a1607c1fd5159866d11e2c588a82075acbfe\""));

  private Map<CharSequence, String> headers_2 = Map.ofEntries(
      Map.entry("Accept", "text/css,*/*;q=0.1"),
      Map.entry("If-None-Match", "\"afc8680c0758c55f06b88b37f9e91c82caf3d032\""),
      Map.entry("Priority", "u=2"));

  private Map<CharSequence, String> headers_3 = Map.ofEntries(
      Map.entry("Accept", "*/*"),
      Map.entry("If-None-Match", "\"b3450116561cbc11633ff061af660c367d50ba06\""),
      Map.entry("Priority", "u=4"));

  private Map<CharSequence, String> headers_4 = Map.ofEntries(
      Map.entry("Accept", "*/*"),
      Map.entry("If-None-Match", "\"27e0fe43423fe8f486221b8073178dcdd204d856\""),
      Map.entry("Priority", "u=4"));

  private Map<CharSequence, String> headers_5 = Map.ofEntries(
      Map.entry("Accept", "*/*"),
      Map.entry("Access-Control-Request-Headers", "authorization"),
      Map.entry("Access-Control-Request-Method", "GET"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("Priority", "u=4"));

  private Map<CharSequence, String> headers_6 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("If-None-Match", "W/\"35b-NaSU7KqIGyrmFg7+ucxIow85Vs4\""),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTk3MjUsImV4cCI6MTc0NjIyMzMyNX0.81p4eAd-5S-VxyXcOVnq3jOWUPunlP8WooRMw5Ij6YQ"));

  private Map<CharSequence, String> headers_7 = Map.of("Priority", "u=5, i");

  private Map<CharSequence, String> headers_8 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"21f6-B8F5Igraxr4/QqWALhZZcBpHvII\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_9 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d37f-3RR2dYKA6JX5k8L83u+m4BuWOUY\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_10 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d6ac-kjRliOFbxvcjGXxzZQ7TN6zOUQc\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_11 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d53a-Dtqnn13r9KhPmwvwpE+jvAR2h4g\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_12 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d6a1-0OFIVCf8PyAK0jKFUY/ufGKd89M\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_13 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d3f9-HRLhvAvYCWBlD1tjVjaQAB6yNwU\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_14 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d714-shMkvStXVKtpUZJhwxMAKZYjqm8\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_15 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d37a-jQphgqDUYf0g/Kv27O72wgD1rmA\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_16 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d340-QI2fU2Uv6m1AsKf0bWPFWxpaJXM\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_17 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d8b5-nQbQrJwNgsIq8BWSfHf6g74B2wg\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_18 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"24c5-NCUell6lyWg6CPlWPWt3MD4JRZ8\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_19 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d56b-QfYGmE11Lv/qccKZFJLT7Ijaf9M\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_20 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d520-eMR213B4nWg19L7yh+Lwlg8XC4c\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_21 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d4d8-izcEwBLCmlE2EuJAwJWp1y4ChtQ\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_22 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d8d1-yDtiK8ElAryp8/Yr0G+Paics0LY\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_23 = Map.ofEntries(
      Map.entry("If-None-Match", "W/\"1d627-saa5D3OPly/eu1R9xFu6ihcmV88\""),
      Map.entry("Priority", "u=5"));

  private Map<CharSequence, String> headers_24 = Map.ofEntries(
      Map.entry("Accept", "*/*"),
      Map.entry("Access-Control-Request-Headers", "authorization"),
      Map.entry("Access-Control-Request-Method", "POST"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("Priority", "u=4"));

  private Map<CharSequence, String> headers_25 = Map.ofEntries(
      Map.entry("Accept", "application/json, text/plain, */*"),
      Map.entry("Content-Type", "multipart/form-data; boundary=----geckoformboundarya5ac9405533cf5a821e1eef8b0a0c56a"),
      Map.entry("Origin", "http://wichat-en1b.francecentral.cloudapp.azure.com:3000"),
      Map.entry("authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDE5ZWJjNjAwNWJiYjkyZjY2NmQiLCJ1c2VybmFtZSI6ImFsYmVydG8iLCJpYXQiOjE3NDYyMTk3MjUsImV4cCI6MTc0NjIyMzMyNX0.81p4eAd-5S-VxyXcOVnq3jOWUPunlP8WooRMw5Ij6YQ"));

  private String uri1 = "wichat-en1b.francecentral.cloudapp.azure.com";

  private ScenarioBuilder scn = scenario("UploadProfileImgSimulation")
      .exec(
          http("go to profile")
              .get("http://" + uri1 + ":3000/profile/alberto")
              .headers(headers_0)
              .resources(
                  http("get static/js/main.02b5991e.js")
                      .get("http://" + uri1 + ":3000/static/js/main.02b5991e.js")
                      .headers(headers_1),
                  http("get static/css/main.2a5e35aa.css")
                      .get("http://" + uri1 + ":3000/static/css/main.2a5e35aa.css")
                      .headers(headers_2),
                  http("get locales/en.json")
                      .get("http://" + uri1 + ":3000/locales/en.json")
                      .headers(headers_3),
                  http("get locales/en-US.json")
                      .get("http://" + uri1 + ":3000/locales/en-US.json")
                      .headers(headers_4),
                  http("get profile")
                      .options("/profile/alberto")
                      .headers(headers_5),
                  http("get profile")
                      .get("/profile/alberto")
                      .headers(headers_6),
                  http("get profile image")
                      .get("/users/alberto/image?timestamp=1746220633845")
                      .headers(headers_7)),
          pause(1),
          http("get default images")
              .get("/default-images/image_1.png")
              .headers(headers_8)
              .resources(
                  http("get default image 8")
                      .get("/default-images/image_8.png")
                      .headers(headers_9),
                  http("get default image 10")
                      .get("/default-images/image_4.png")
                      .headers(headers_10),
                  http("get default image 6")
                      .get("/default-images/image_6.png")
                      .headers(headers_11),
                  http("get default image 11")
                      .get("/default-images/image_11.png")
                      .headers(headers_12),
                  http("get default image 12")
                      .get("/default-images/image_12.png")
                      .headers(headers_13),
                  http("get default image 15")
                      .get("/default-images/image_15.png")
                      .headers(headers_14),
                  http("get default image 7")
                      .get("/default-images/image_7.png")
                      .headers(headers_15),
                  http("get default image 13")
                      .get("/default-images/image_13.png")
                      .headers(headers_16),
                  http("get default image 9")
                      .get("/default-images/image_9.png")
                      .headers(headers_17),
                  http("get default image 2")
                      .get("/default-images/image_2.png")
                      .headers(headers_18),
                  http("get default image 5")
                      .get("/default-images/image_5.png")
                      .headers(headers_19),
                  http("get default image 16")
                      .get("/default-images/image_16.png")
                      .headers(headers_20),
                  http("get default image 3")
                      .get("/default-images/image_3.png")
                      .headers(headers_21),
                  http("get default image 10")
                      .get("/default-images/image_10.png")
                      .headers(headers_22),
                  http("get default image 14")
                      .get("/default-images/image_14.png")
                      .headers(headers_23)),
          pause(2),
          http("options custom image")
              .options("/users/alberto/custom-image")
              .headers(headers_24)
              .resources(
                  http("post custom image")
                      .post("/users/alberto/custom-image")
                      .headers(headers_25)
                      .body(RawFileBody("io/gatling/demo/uploadprofileimgsimulation/0025_request.json")),
                  http("get new profile image")
                      .get("/users/alberto/image?timestamp=1746220637423")
                      .headers(headers_7)));

  {
    setUp(scn.injectOpen(constantUsersPerSec(5).during(30).randomized()))
        .protocols(httpProtocol);
  }
}
