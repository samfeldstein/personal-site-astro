---
title: "Coursera Practice: Cybersecurity Incident Report"
pubDate: 2025-05-03
assignment:
  description: Identify the likely cause of a service interruption to a client's website. Explain how the attack occurred and the negative impact it had on the website.
  site: Coursera.org
  url: https://www.coursera.org/learn/networks-and-network-security/assignment-submission/QHIX5/activity-analyze-network-attacks/
---

## Scenario

You work as a security analyst for a travel agency that advertises sales and promotions on the company’s website. The employees of the company regularly access the company’s sales webpage to search for vacation packages their customers might like.

One afternoon, you receive an automated alert from your monitoring system indicating a problem with the web server. You attempt to visit the company’s website, but you receive a connection timeout error message in your browser.

You use a packet sniffer to capture data packets in transit to and from the web server. You notice a large number of TCP SYN requests coming from an unfamiliar IP address. The web server appears to be overwhelmed by the volume of incoming traffic and is losing its ability to respond to the abnormally large number of SYN requests. You suspect the server is under attack by a malicious actor. 

You need to alert your manager about this problem quickly and discuss the next steps to stop this attacker and prevent this problem from happening again. You will need to be prepared to tell your boss about the type of attack you discovered and how it was affecting the web server and employees.

## Assignment: Incident Report

The network log shows numerous TCP SYN requests from one IP address. This suggests a **SYN flood attack**, where the attacker floods the server with connection requests to exhaust its resources and cause a denial of service.

### SYN flood attack explanation

When website visitors try to establish a connection with a web server, a **three-way handshake** occurs using the TCP protocol:

1. The client sends a SYN packet to the server. This initiates the handshake.
2. The server responds with a SYN-ACK packet, which acknowledges receipt of the SYN packet.
3. The client responds with an ACK packet, which acknowledges receipt of the SYN-ACK packet.

In a SYN flood attack, the attacker sends many SYN packets to the server, each requesting a connection. The server responds with a SYN-ACK packet, but the attacker never sends the final ACK response, so the server’s resources are tied up waiting for it. This can exhaust the server's capacity and make it slow down or crash, causing legitimate connections to fail.