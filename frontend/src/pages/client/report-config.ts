import type { AuditSection, DmSection } from "./report-types";

export const sections: DmSection[] = [
  {
    key: "callLogsSummary",
    label: "Call Logs Summary File",
    description: `This file shows everything that happened on every call in your campaign.
It captures all outcomes — leads, voicemails, wrong numbers, not interested, dead calls, etc.
It gives a clean picture of how your data is performing during real conversations
`,
    fields: [
      {
        name: "fileOverview",
        label: "File Overview",
        help: `File Breakdown:
Log Date – The date of the call activity
Camp Name – Campaign name
File Name – Lists being dialed
All Log Types (Dispos) – Voicemail, Unknown, Wrong Number, etc.
General Leads – All leads
Qualified Leads – High-quality leads
CTQL – Connects to Qualified Leads ratio
Total Connects – Total real conversations
`,
      },
      { name: "listName", label: "List Name" },
      { name: "notes", label: "Notes" },
    ],
  },
  {
    key: "filesReport",
    label: "Files Report File",
    description: `This file shows the daily performance of every list inside your campaign.
It helps you see:
How each list performed day by day
Which lists are strong
Which lists are slowing down
How list quality affects your results
It also includes a full summary of performance across the entire date range.
`,
    fields: [
      {
        name: "fileOverview",
        label: "File Overview",
        help: `File Breakdown:
Each row = one list on one day.
This file includes:
Date – When the list was dialed
File Name – The list being used
Calls – Total calls
NIS – Not-in-service numbers
Answer % – How many owners answered
Machines – Voicemails
Connects – Real conversations
CTC (Calls to Connects) – Efficiency of dialing
Abandoned – Calls missed because an agent was busy
Decision Maker Leads – Owners interested in selling
Connects to DM Leads – How many conversations needed for one lead
Qualified Leads – Leads that passed QC
Connects to Qualified Leads – Conversations required per QL
This breakdown allows both you and our team to clearly evaluate list strength.`,
      },
      { name: "notes", label: "Notes" },
    ],
  },
  {
    key: "campaignReport",
    label: "Campaign Report File",
    description: `This file shows the daily performance of your entire campaign (not individual lists).
It gives a complete picture of:
Total calls
Connects
Answer rate
Voicemails
Not-in-service numbers
Abandoned calls
Leads and qualified leads
You also get a full summary of the campaign’s total performance across the selected date range.
`,
    fields: [
      {
        name: "fileOverview",
        label: "File Overview",
        help: `File Breakdown:
Each row = the whole campaign on a specific day.
This file includes:
Date – When the calls happened
Calls – Total outbound calls
NIS – Numbers not in service
Answer % – Percentage of owners who answered
Machines – Voicemails
Connects – Real conversations
CTC (Calls to Connects) – How many calls it takes to reach one owner
Abandoned – Missed answers due to agent availability
Decision Maker Leads – Owners interested in selling
Connects to DM Leads – Conversations needed for one lead
Qualified Leads – Leads that pass quality requirements
Connects to Qualified Leads – Conversations needed per QL


These metrics help both us and you understand how the entire campaign is moving day by day.
`,
      },
      { name: "notes", label: "Notes" },
    ],
  },
  {
    key: "callLogsOutput",
    label: "Call Logs Output",
    description: `This file gives full call-by-call transparency for your entire campaign.
It shows every single call made, including:
The result of the call
The time it happened
The agent who made it
The homeowner’s details


This is the most detailed file in the package.
`,
    fields: [
      {
        name: "fileOverview",
        label: "File Overview",
        help: `File Breakdown:
Each row = one call.
This file includes:
Call Log ID – Unique reference for the call
Log Date & Time – When the call happened
Call Type – Dialer / Manual / Inbound
Log Type – Voicemail, Decision Maker, Wrong Number, Dead Call, Sold, etc.
Original Lead File – List the number came from
Campaign Name – Current campaign
Phone Number – Number dialed
Homeowner Name – First and Last
Recording Length – Duration of the call
Full Address (City, State, Zip) – Property info`,
      },
      { name: "notes", label: "Notes" },
    ],
  },
  {
    key: "didsLogs",
    label: "DIDs Logs File",
    description: `This file tracks the health and performance of every DID (outbound phone number) used to dial your lists.
DIDs can get flagged, filtered, or slowed down by phone carriers — and this report helps us stay ahead of those issues.
Healthy DIDs = better answer rates, more connects, and fewer spam risks.
`,
    fields: [
      {
        name: "fileOverview",
        label: "File Overview",
        help: `File Breakdown:
Each row represents one DID and its current status.
This file includes:
DID Number – The phone number used for dialing
Health Status – Healthy / Flagged / Flagged By all
Usage Activity – How many calls the DID made
Connect Rate – How well the number is performing
Spam Likelihood – Early warning signs of flagging
Replacement Cycle – When the DID was last changed
These details help keep your outbound numbers safe, clean, and efficient.
`,
      },
      { name: "notes", label: "Notes" },
    ],
  },
  {
    key: "flashCards",
    label: "Flash Cards",
    description: `The Flashcard provides a quick, high-level summary of your campaign’s performance for a chosen period (daily, weekly, or monthly).
It gives you an instant overview of the most important metrics, without needing to open multiple files.
It’s designed to be simple, visual, and easy to read — perfect for fast decision-making.
`,
    fields: [
      {
        name: "fileOverview",
        label: "File Overview",
        help: `File Breakdown:
The Flashcard is divided into four sections:
A. Client & Campaign Snapshot
Includes:
Client name
Campaign name
Days active
Total leads this period
Analysis type (Daily/Weekly/Monthly)
Reason for the analysis


B. Dialer Performance Report
Shows the key dialing metrics compared against benchmarks:
Total calls
Connects
CTC
Machines %
NIS %
CTL
CTQL


Each metric is color-classified (Good, Average, High) so you can quickly see where performance stands.





C. Disposition Report
Displays the percentage of each call outcome:
Decision Maker Lead
NYI
DNC Decision Maker
Wrong Number
Voicemail
Dead Call
Unknown


Each disposition is compared to its benchmark and labeled as Good / Average / Bad with notes explaining why.


D. Overall Feedback
A simple summary including:
Key observations
Action items & recommendations
Next steps
Overall performance rating (Good, Average, Needs Improvement)


This section shows exactly what needs to be improved and what the Data Team will do next.
`,
      },
      { name: "notes", label: "Notes" },
    ],
  },
];

export const auditSections: AuditSection[] = [
  {
    title: "Campaign Performance Issues",
    fields: [
      {
        key: "effortIssue",
        label: "Effort Issue from Agents",
      },
      {
        key: "rebuttalsIssue",
        label: "Rebuttals Issue",
      },
      {
        key: "releasingIssue",
        label: "Releasing Issue",
      },
      {
        key: "activeTonalityIssue",
        label: "Active Tonality Issue",
      },
    ],
  },
  {
    title: "Action Points",
    fields: [
      {
        key: "agentsNeedCoaching",
        label: "Agents Need Coaching",
      },
      {
        key: "agentsAllocationIssue",
        label: "Agents Allocation Issue",
      },
      {
        key: "campaignListIssue",
        label: "Campaign List Issue",
      },
    ],
  },
];
