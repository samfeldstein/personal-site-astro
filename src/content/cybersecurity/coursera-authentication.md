---
title: "Coursera Challenge: Improve Authentication and Authorization for a Small Business"
pubDate: 2025-05-21
assignment:
  description: Assess the access controls used by a business. Analyze their current process, identify issues, and make recommendations to improve their security practices.
  site: Coursera.org
  url: https://www.coursera.org/learn/assets-threats-and-vulnerabilities/assignment-submission/waX2u/activity-improve-authentication-authorization-and-accounting-for-a-small/attempt
---

## Scenario

You’re the first cybersecurity professional hired by a growing business. **Recently, a deposit was made from the business to an unknown bank account.** The finance manager says they didn’t make a mistake. Fortunately, they were able to stop the payment. The owner has asked you to investigate what happened to prevent any future incidents.

To do this, you’ll need to do some accounting on the incident to better understand what happened:

1. First, you will review the access log of the incident.
2. Next, you will take notes that can help you identify a possible threat actor.
3. Then, you will spot issues with the access controls that were exploited by the user.
4. Finally, you will recommend mitigations that can improve the business' access controls and reduce the likelihood that this incident reoccurs.

## Assignment

### Notes

*List 1-2 pieces of information that can help identify the threat.*

Based on the provided [event log](https://docs.google.com/spreadsheets/d/1g1ViMiR4BiRvuRLi8GBVoOMgtvb_8y1MsO3fso1TfiI/template/preview?gid=0#gid=0), we see that the event was caused by a user on a computer called `Up2-NoGud`, with an IP of `152.207.255.255`. The incident occurred at **8:29:57 AM**.

Looking at the [employee directory](https://docs.google.com/spreadsheets/d/1g1ViMiR4BiRvuRLi8GBVoOMgtvb_8y1MsO3fso1TfiI/template/preview?gid=0#gid=0), we see that **Robert Taylor Jr.**, an attorney, last accessed the system at the exact same time the incident occurred (8:29:57 AM). His IP address also matches that of the device on the event log(`152.207.255.255`). 

### Issues

*Based on your notes, list 1-2 authorization issues.*

The user had an access level of `Admin`, which violates least privilege.

Their account is still active even though the employee directory shows they left the company in 2019. The incident happened in 2023.

### Recommendations

*Make at least 1 recommendation that could prevent this kind of incident.*

Right now, every employee has an access level of `Admin.` I recommend assigning roles to employees to restrict their access to data and permissions they don't need (least privilege).

I also recommend deleting accounts for all former employees.