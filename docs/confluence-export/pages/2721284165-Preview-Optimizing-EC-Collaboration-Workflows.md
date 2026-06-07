---
confluence_id: "2721284165"
title: "Preview: Optimizing EC Collaboration Workflows"
status: current
parent_id: "2583822375"
depth: 1
domain: template
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/2721284165
local_joyboy_doc: null
blog_post: null
---
## Intro

- personal

- rick
- work

- Web(onepiece)
- POS
- Fortress
- Architecture Design
- …
Hello everyone, I'm Rick. You may have heard my name before, but you may not know exactly what my job is. Let me briefly explain my work.

 

![](attachment)

 

I hold a Code Review meeting every Wednesday to ensure our code changes are not smelly code.

Every Friday, we have a front-end requirement review meeting. At this meeting, everyone will introduce what they will be working on the following week, and we will decide together how many story points for each task.

Of course, in addition to the above, I am also a firefighter. If there is a fire somewhere, I need to go and put it out.

## Refactoring POS System

### My Task

 

![](attachment)

 

Recently, you may have heard that I'm in charge of refactoring the POS system.

This task will take a lot of time , maybe somebody will task why ?

If I were simply building a POS system, or any system for that matter, it would be a very easy task.

- New POS system

- Solve technical debt (use more modern technology)
- Complete a responsive POS System
- Follow Fortress design style
But I don't plan to do it that way.

This is like building a house, but what if we are building a city instead? For example, building a city like sg ?

Today I build a house A here, tomorrow I build a house B there. If everyone builds randomly like this, I think after two years, this city may have problems due to lack of planning

So building a city requires an overall architect to ensure orderly development.

Besides the chaos , there are also repetitive work issues. For example :

- promotions feature :when we want that feature in POS, we have to redevelop it.
- O2O in pos system :Bahri once asked me why I hadn't followed Fortress's design. the reason is that develop fortress just for pos system would take too much time
Is there a way for us to develop a feature once that works across web and POS without redeveloping it?

Is it even possible that if we want an app in the future, we can quickly leverage our existing codebase without redeveloping ?

### My Goals

 

![](attachment)

 

- My goals

- Faster delivery
- Reusability

- UI
- Logic
- Easier maintenance
- scalable
Yes, all of these are possible, and it's already been achieved - not just a future possibility. In the new architecture I designed, a web feature can be implemented on POS within minutes, sharing the same logic and UI.

Moreover, if we want to develop an app or wechat little-program in the future?

Or even an Apple Vision Pro app?

It's all possible now. We only need some initial work to support a new platform, and thereafter, all new features will work across platforms with the same codebase.

### `Joyboy` : Forward-thinking Architecture

 

![](attachment)

 

But don't worry, I won't go into boring technical details today, just some key highlights:

- Just like we call our online site "onepiece", that's the project name. Now this new project is called "Joyboy", which included web, pos, fortress, and everything. So in the future, we might all use web and POS to represent the two systems, no longer using OnePiece to represent web.
- Going forward, changing a feature will impact both web and pos. So ideally, we want pos and web to be as consistent as possible , but differences are allowed when necessary.
and that's all , it's cool ?

### But

So, I've been with Castlery for about a year and a half, and I've been thinking - What are the real challenges we're facing when it comes to project delivery?

Is it just about designing the code?

Now that I've designed a forward-thinking code architecture to reduce the cost, but is that really all we need?

I don't think so

 

![](attachment)

 

When reading a book, I strongly agreed with one point: **If the input is bad (unclear requirements or a bad design), then no amount of coding can create a good output.**

## So, are we requirements clear and design good ?

#### maybe not, since

- Different languages
- Different work habits
- High turnover and lack of documentation
The first issue is obvious. Like right now, even as I communicate with you in English, I'm not sure if what I'm saying is accurate . What you hear and understand might be different from what I intend to express.

The second issue is that, for instance, Gail from Australia might have her own way of expressing needs, like way A. Jiali from Singapore might have way B, while Juan from China might have way C.

One developer may have to deal with product managers describing requirements in vastly different ways.

The third issue is our high staff turnover, but our system has been iterating for over 7 years. there's been no enough documentation, In this situation, even an experienced product manager may not be fully familiar with our system - how can they write clear requirement docs then?

### I know , I know , and then ?

Regarding these issues, almost every member has complained to me . We all know the challenges, and we also want to solve them, but how?

Software engineering has been developing for so many years now.

These problems are not exclusive to our company.

there are actually ready-made solutions to our problems.

The first solution is DDD .

## Domain Driven Design (DDD)

DDD is a vast and complex topic.

Today, I'll only introduce one key aspect: shared model.

### The Importance of a Shared Model

 

![](attachment)

 

Normally, our requirement process goes like this: stakeholders request a feature from the product team, the product team devises a solution and creates a task for developers, and then the development team implements it.

It's a common process, but sometimes we still struggle to follow it correctly.

 

![](attachment)

 

However, this approach can lead to loss of information during transmission, resulting in features going live that might not align with the initial requirements at all.

 

![](attachment)

 

Even if we minimize the number of transitions, the final code may still differ from the product documentation.

 

![](attachment)

 

In DDD, the goal is for everyone to share the same mental model, including having the code itself based on that model.

This way, there's no translation loss of important information.

### How to create a shared model

- The Importance of a Shared Model
- How to create a shared model

- Event Storming（☆）
- Event Modeling（★）
Since a shared model is so importance, how do we create it? Traditional DDD uses Event Storming for modeling, but I find it quite complex.

Based on my work experience, usability is key to promoting a process.

Since today is just a preview, not a training session,

I'll send you the articles I referenced. You can skim them now to ease the pain of listening to me speak English.

- [Event Modeling: What is it?](https://eventmodeling.org/posts/what-is-event-modeling/#seven-steps)
- [Create an event model tutorial](https://docs.onote.com/onote-docs/Latest/glossary.html)
In my initial plan, we'll use Figma for collaboration first.

Today, we only need to know four key terms:

- Command
- Read Models
- Automation(Policy)
- Event
You can find the meanings of these words in the article I sent. I won't introduce them one by one.

> Command

A user intention that changes a system. For example, book a hotel room. Commands show how users create change in a system and how they share input with a system. Commands are represented as blue objects on the timeline lane within an event model.

> Event

Events or facts stored on a timeline. Events represent the possible business processes and outcomes when a user interacts with your application. Events are represented as orange objects within a model.

> Read model

Read models are the result of the command-event chain. Also referred to as Views. Informs users about the state of a system. For example, what are the available dates to book for a room. Read models are represented as green objects on a timeline lane within an event model.

 

> Automation(Policy)

some commands are added to the model but have no specific actor associated with them. During this step, you look for automation policies that might execute those commands.

![](attachment)

for now , I'll make a demo to show everyone how they are used.

### Show Demo

 

![](attachment)

 

> [figam](https://www.figma.com/file/qHShTal4FQzXUZ1phkldmw/%5BPOS%5D-Event-Modeling?type=whiteboard&node-id=0-1&t=EhTtelkSGwyg799d-0)

Now, assume I'm a product manager. The sales reps told me they want to recalculate shipping fees when changing stock locations. After thinking through a solution, I sketched it out.

Then I invite

- SaleReps(Stakeholder)
- UX Designer
- FE
- BE
- QA
for a small session.
Let's think about what events could occur for this feature.

- VariantUpdatedEvent
- VariantQuantityUpdatedEvent
- stockLocationUpdatedEvent
Events are generated from Commands.

Here, the commands would be:

- changeVariant
- changeVariantQuantity
- changeStockLocation
At this point, the BE tells me that whenever Variant, Quantity, or Stock Location changes, the front-end should re-call the `leadtime_shipping_fee` API.

- `GetLeadtimeShippingFee`
It seems we've almost created the model, but then the sales rep asks if we can disable ATC and change the text to "out of stock" when inventory is zero.

The BE says that's possible - if out of stock, the `GetLeadtimeShippingFee` API won't return a delivery time, but an out-of-stock status instead. The FE dev says they'll then set the ATC button as disabled based on that API response.

Yep! The shared model is created:

 

![](attachment)

 

![](attachment)

 

- Now devs can code directly based on this shared model. The code names match the model as same as , no misunderstanding possible.
- UX can design the final mockups based on our discussion.
- QA can write test cases.
- PM can document the requirements(Gherkin).
Simple, right?

This was just a quick preview of the shared model concept from DDD.

Okay, let's move on to another topic - BDD.

## Behavior Driven Development (BDD)

 

![](attachment)

 

Maybe DDD is a little bit cool. Is that all?

Remember the commands, events, and read models we wrote earlier?

These can easily make User Stories written in Gherkin.

> - **Given**: A view of the tasks to do,
- **When** This command is launched for each item,
- **Then** These events are expected back.”

### Gherkin(User Story Format)

```
Feature: Guess the word
  # The first example has two steps
  Scenario: Maker starts a game
    When the Maker starts a game
    Then the Maker waits for a Breaker to join
  # The second example has three steps
  Scenario: Breaker joins a game
    Given the Maker has started a game with the word "silky"
    When the Breaker joins the Maker's game
    Then the Breaker must guess a word with 5 characters
```

Doesn't it look similar?

### Why Gherkin?

As you know, in Chinese teams, products prefer writing Requirements, but in SG, I find you prefer writing User Stories.

Personally, I tend to prefer User Stories too, but when we ask others what User Stories are, everyone has their own version.

So I hope to have a standard to follow, and that's Gherkin.

Remember when I said one challenge is every product manager having their own work habits? If we all use Gherkin, we can solve that.

But just deciding to use Gherkin is easy, like me choosing to speak in English - that doesn't guarantee I can do it well.

now , the shared model we just created comes in handy now.

the Commands, Events, and Read Models from the shared model can actually help us quickly produce reasonably accurate Gherkins.

```
Feature: Sales Representative can see the Variant leadtime  on the PDP
  Background:
    Given the sales representative on the PDP
  Scenario Outline: Product Availability after <command>
    Given the sales representative <command> on the PDP
    When the system triggers 'getleadtimeshippingfee'
    Then display the Estimated Delivery information and ensure the Add to Cart button is clickable
    Examples:
      | command                 |
      | change-variant          |
      | change-stock-location   |
      | change-variant-quantity |
  Scenario Outline: Product Unavailability after <command>
    Given the sales representative <command> on the PDP
    When the system triggers 'getleadtimeshippingfee'
    Then display the Out of Stock information and ensure the Add to Cart button is disabled
    Examples:
      | command                 |
      | change-variant          |
      | change-stock-location   |
      | change-variant-quantity |
```

We just need to lightly adjust the shared model from earlier to generate a Gherkin doc.

Today, I won't go into the BDD process details, so just having a high-level impression is enough.

### Key activities of a BDD team

 

![](attachment)

 

You just need to know.

We'll eventually store these user stories in a feature file within the codebase. We'll write validation code based on this file, validated and updated with each release.

 

![](attachment)

 

### show document

Like this.

 

![](attachment)

> Don't worry about those mistakes, because I haven't had time to perfect it yet.

This documentation will be automatically stored somewhere accessible in the future, so not just we can see it, but also like sales reps can access, maybe they can even use this for employee training, telling them what functions the POS system has.

Cool, one checklist item down, just one last thing

## Component-Driven Development（CDD）

- ~DDD(Domain-Driven Design)~
- ~BDD(Behavior-Driven Development)~
- CDD (Component-Driven Development)
Similarly, today we're just doing a simple presentation on CDD without discussing the specific CDD process.

Remember the sketch we just discussed? After we've finished discussing Event Modeling, designers will generate corresponding mockups based on the sketch.

 

![](attachment)

 

For frontend , we break down mockups into individual components.

This approach has been in trial on Fortress for a while now,

![](attachment)

and starting from the new architecture, every component seen on the page needs to follow this pattern.

This approach brings many benefits.

in a feature , everyone can access this site. We can see what many pages look like without logging into POS or the web.

And, import thing is , there's automation testing, such as accessibility testing.

## Book Recommend

![](attachment)

![](attachment)