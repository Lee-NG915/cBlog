---
confluence_id: "2617049089"
title: "Castlery Client Side Architecture Design（草稿）"
status: current
parent_id: "2583822375"
depth: 1
domain: architecture
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/2617049089
local_joyboy_doc: null
blog_post: null
---
## 现状和背景

![](attachment)

1. - Web 和 POS 代码太难维护
2. - 存在前端的业务逻辑过多
3. - Web 和 POS 已经迭代了 7 年了
4. - POS 会逐步添加 Web 的很多功能（O2O）
5. - 存在多端复用性问题（UI 组件和业务逻辑都无法复用）
6. - 没有测试代码，如何确保重构正常上线
7. - 文档缺失（需求文档及设计文档）
8. - 需求不明确，沟通效率低
当我看到这些信息时，如果**从代码的角度**出发，就是使用 monorepo 来构建一个可以复用 UI 和业务逻辑的架构，然后立马技术选型：

- monorepo tool

- 
- 
- …
- Web Framework

- 
- 
- 
- …
- State Management

- 
- 
- …
- …
![](attachment)

可是对于架构设计，真的只需要从代码角度去思考吗？

> As a developer, you may think that your job is to write code.

I disagree. A developer’s job is to solve a problem through software, and coding is just one aspect of software development. **Good design and communication are just as important, if not more so.**

If you think of software development as a pipeline with an input (requirements) and an output (the final deliverable), then the **“garbage in, garbage out”** rule applies. **If the input is bad (unclear requirements or a bad design), then no amount of coding can create a good output.**


-- Domain Modeling Made Functional-Scott Wlaschin

关于**沟通问题**，才是架构设计中最大的挑战，而在前面的思考里却根本没有考虑到它。

那么该怎么去设计一套能**解决复杂项目及沟通的问题**的架构呢？

这让我想到一句互联网黑话：你有形成自己的方法论吗？

领域驱动设计（DDD）就是为了解决上述问题的方法论，接下来我将介绍我如何运用 DDD 去设计这一套前端架构。

## Understanding the domain

### The Importance of a Shared Model

![](attachment)

![](attachment)

这个点像我们上次 10 周年，最后一个人往队伍前一个人的背上写字来传递文字，结果到了第一个人的时候，最开始的信息已经在经过层层传递中丢失了。

![](attachment)

那既然是因为信息在多层传递中丢失，我们下意识的思路是减少传递的次数。

虽然这在一定程度上是有效的，但是实际还是存在一个问题，在这里开发人员充当 translator，将 Domain experts 的 mental model 翻译成 code。但在任何 translation 中，这一过程都可能导致重要疑问的失真和丢失。

![](attachment)

在 DDD 的目标中，就是所有人共用一套 mental model，包括代码本身也应该基于 mental model。这样就不会有转换，即不会丢失重要的问题。

![](attachment)

Aligning the software model with the business domain has a number of benefits

- Faster time to market
- More business value
- Less waste
- Easier maintenance and evolution.
## Modeling the domain

### How to create a shared model ?

The domain-drivendesign community has developed some guidelines to help us here. They are as follows:

- **Focus on business events** and workflows rather than data structures.
- Partition the problem domain **into smaller subdomains**.
- **Create a model **of each subdomain in the solution.
- **Develop a common language (known as the “Ubiquitous Language”) **that is shared between everyone involved in the project and is used everywhere in the code ↗
这里向大家介绍两种快速建模的方式，他们其实大同小异

- EventStorming
- Event Modeling
There’s not much *new* about *Event Modeling*. It’s more of a **formalization** of all the knowledge we’ve acquired about building event-driven systems.



This traces all the way back to around 2003 when [Eric Evans](https://twitter.com/ericevans0?lang=en) released the original *Domain Driven Design* book, [Fowler](https://twitter.com/martinfowler?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor) wrote about Event-Sourcing in 2005, [Greg Young](https://twitter.com/gregyoung?lang=en) popularized CQRS and Event Sourcing from 2007 to 2012, and 2013 when **Brandolini** used Event Storming as a way to understand and plan a project around a problem domain.

> 关于两者具体的差别可以阅读：[Natural Human Thinking - Event Storming vs Event Modeling](https://eventmodeling.org/posts/human-natural-thinking/)

#### EventStorming

![](attachment)

![](attachment)



![](attachment)

> 因为这次分享只是涉及到前端领域的重点，具体的 EventStorming 暂不介绍，可以看这篇文章

#### Event Modeling



While it shares its similarities with *Event Storming*, the main addition to *Event Modeling* that wasn’t formally defined in *Event Storming* was the use of UI drawings in order to present the views more effectively.

![](attachment)

![](attachment)

#### WorkShop Format

Event Modeling is done in 7 steps. We explained the end-goal already. So let’s rewind to the beginning and show how to build up to the blueprint:

##### 1. Brain Storming

![](attachment)

##### 2. The Plot

![](attachment)

##### 3. The Story Board

![](attachment)

##### 4. Identify Inputs

![](attachment)

##### 5. Identify Outputs

![](attachment)

##### 6. ….



#### Most business process model

![](attachment)

![](attachment)

#### Conclude ?

The process of elaborating domain requirements is perpetual.

![](attachment)

Each workflow step is tied to either a command or a view/read-model. The specifications were explained earlier on. How we make them is still collaboratively with all participants in the same space. A `Give-When-Then` or `Given-Then` can be constructed one after the other very rapidly while being reviewed by multiple role representatives. This allows what is traditionally done as user story writing by a dedicated product owner in isolation in a text format, to be done visually in a very small amount of time collaboratively. What’s very critical here, is that each specification is tied to exactly one command or view.

| User Story |  | UI |
| Give | Arrange | Situation |
| When | Act | Motivation |
| Then | Assert | Value |


![](attachment)

今天只是大概挑了一些我觉得是 DDD 里比较重要的模块进行分享，实际 DDD 是一个很大的 topic ，而且具体到 field 的建模，比如 Entities, Value Object , Aggregate , Aggregate root 等概念，这次都没是有涉及到，原因是这些内容更多应该在后端侧落地，前端只是复用这个模型，因为实在是没必要区分前后端。

> 主要是这期重构是基于原本的接口，所以我就没写相关的介绍。哈哈哈

#### 如何在 Castlery 落地

[Figma](https://www.figma.com/file/ZYtaZ8Pp1aamrWtLwNsoJu/%5BEvent-Modeling%5DPOS?type=whiteboard&node-id=0-1&t=CkTIVO9ItWw2CV78-0)

## Implement the model

### Layered Architecture

![](attachment)

### Vertical Slice Architecture

![](attachment)

![](attachment)

### Clean Architecture

![](attachment)

![](attachment)

整洁架构的重点就在于依赖关系。

这里举例一个例子，比如上图说到的 `External Inferfaces`，作为 web 最常见的一点就是 `cookie`，它是做为最外层的东西，但是我们经常会在业务逻辑里面使用到。这个有点像后端代码里业务代码会做存储操作，而存储操作又是涉及到 DB（最外层依赖）的，这里就会涉及到一个原则

![](attachment)



具体为啥要这么设计可以看一下这边文章 [Dependency Injection & Inversion Explained | Node.js w/ TypeScript](https://khalilstemmler.com/articles/tutorials/dependency-injection-inversion-explained/)

> 立马想到就有两种好处

- 避免源码依赖，可以减少编译次数
- 方便 mock 依赖，对写测试代码友好，

### Event-Driven Architecture

> Event-Driven Architecture



Stated simply, event-driven architecture is an architectural style in which a system’s components communicate with one another asynchronously by exchanging event messages

- ![](attachment)
Instead of calling the services’ endpoints synchronously, the components publish events to notify other system elements of changes in the system’s domain. The components can subscribe to events raised in the system and react accordingly.

![](attachment)

#### Events, Commands(Action), and Messages(payload) , Listener(Policy,Rule)

![](attachment)

![](attachment)

### CQRS(Command/Query Responsibility Segregation)

![](attachment)

#### Queries(Selected) && Mutations(Command)

```
import React from 'react'
import type { RootState } from '../../app/store'
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from './counterSlice'

export function Counter() {
  const count = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch()

  return (
    <div>
      <div>
        <button
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          Increment
        </button>
        <span>{count}</span>
        <button
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </button>
      </div>
    </div>
  )
}
```

```
export const PostDetail = () => {
  const { id } = useParams<{ id: any }>()
  const navigate = useNavigate()
  const globalPolling = useTypedSelector(selectGlobalPollingEnabled)

  const [isEditing, setIsEditing] = React.useState(false)

  const {
    data: post,
    isFetching,
    isLoading,
  } = useGetPostQuery(id, { pollingInterval: globalPolling ? 3000 : 0 })

  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!post) {
    return <div>Missing post!</div>
  }

  return (
    <div>
      {isEditing ? (
        <EditablePostName
          name={post.name}
          onUpdate={(name) =>
            updatePost({ id, name })
              .then((result) => {
                // handle the success!
                console.log('Update Result', result)
                setIsEditing(false)
              })
              .catch((error) => console.error('Update Error', error))
          }
          onCancel={() => setIsEditing(false)}
          loading={isUpdating}
        />
      ) : (
        <React.Fragment>
          <div className="row">
            <div className="column">
              <h3>
                {post.name} {isFetching ? '...refetching' : ''}
              </h3>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isDeleting || isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Edit'}
            </button>
            <button
              onClick={() => deletePost(id).then(() => navigate('/posts'))}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </React.Fragment>
      )}
      <PostJsonDetail id={id} />
    </div>
  )
}
```

## 参考

- [Event Modeling: What is it?](https://eventmodeling.org/posts/what-is-event-modeling/#elaborate-scenarios)
- [Domain Modeling Made Functional](https://pragprog.com/titles/swdddf/domain-modeling-made-functional/)
- [Learning Domain-Driven Design: Aligning Software Architecture and Business Strategy 1st Edition](https://www.amazon.com/Learning-Domain-Driven-Design-Aligning-Architecture/dp/1098100131)
- [Domain-Driven Design with Java - A Practitioner's Guide: Create simple, elegant, and valuable software solutions for complex business problems](https://www.amazon.com/Domain-Driven-Design-Java-Practitioners-inventive/dp/1800560737)
- [solidbook.io: Introduction to software design & architecture](https://solidbook.io/)
- [Clean Architecture: A Craftsman's Guide to Software Structure and Design (Robert C. Martin Series) ](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/)
- [Dependency Injection & Inversion Explained | Node.js w/ TypeScript](https://khalilstemmler.com/articles/tutorials/dependency-injection-inversion-explained/)
- [Natural Human Thinking - Event Storming vs Event Modeling](https://eventmodeling.org/posts/human-natural-thinking/)