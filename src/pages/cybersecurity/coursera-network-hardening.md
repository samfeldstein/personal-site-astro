---
layout: ../../layouts/BaseLayout.astro
---

# Coursera Activity: Network Hardening Analysis

Completed on **May 6, 2025**. You can find the assignment on [Coursera's website](https://www.coursera.org/learn/networks-and-network-security/assignment-submission/9tlOr/activity-analysis-of-network-hardening).

**Assignment:** A social media organization recently experienced a major data breach caused by undetected vulnerabilities. Identify some common network hardening tools that can be implemented to protect the organization’s overall security. Select a specific vulnerability that the company has and propose different network hardening methods. Explain how the methods and tools you chose will be effective for managing the vulnerability and how they will prevent potential breaches in the future.

## Scenario

You are a security analyst working for a social media organization. The organization recently experienced a major data breach, which compromised the safety of their customers’ personal information, such as names and addresses. Your organization wants to implement strong network hardening practices that can be performed consistently to prevent attacks and breaches in the future. 

After inspecting the organization’s network, you discover four major vulnerabilities. The four vulnerabilities are as follows:

1. The organization’s employees' share passwords. 
2. The admin password for the database is set to the default.
3. The firewalls do not have rules in place to filter traffic coming in and out of the network.
4. Multifactor authentication (MFA) is not used. 

If no action is taken to address these vulnerabilities, the organization is at risk of experiencing another data breach or other attacks in the future. 

**Write a security risk assessment to analyze the incident and explain what methods can be used to further secure the network.**

## Assignment: Risk Assessment Report

 The organization’s network vulnerabilities can be addressed with the following security hardening methods:

1. Setting and enforcing strong **password policies**.
2. Implementing **port filtering** to block unwanted network traffic.
3. Using **multifactor authentication** to verify user identities.

### Password policies

The National Institute of Standards and Technology (NIST) recommends salting and hashing passwords. This removes the need for complex passwords or frequent password changes.

Salting also ensures that even if two people choose the same password, their hashes will be unique.

### Port filtering

Firewalls should be configured to block traffic on unused or unnecessary ports. This can prevent potential attackers from entering a private network.

### Multifactor authentication

Multifactor authentication adds an additional layer of security beyond just a password. MFA requires a user to verify their identity in two or more ways to access a system or network. This can protect against brute force attacks and similar security events.

MFA options include a password, pin number, badge, one-time password (OTP) sent to a cell phone, fingerprint, and more.