import "./App.css"
import { useEffect, useRef, useState } from "react"
import { get, set } from "idb-keyval"
import {
  array,
  boolean,
  enums,
  Infer,
  is,
  number,
  object,
  string,
} from "superstruct"
import { assertNever } from "./utils/assertNever"

const TODOS_DB_KEY = "todos-v1"
const VISIBILITY_DB_KEY = "visibility-v1"

const Todo = object({
  id: number(),
  name: string(),
  isInEditMode: boolean(),
  isCompleted: boolean(),
})

const TodosStruct = array(Todo)
type Todos = Infer<typeof TodosStruct>

const VisibilityStruct = enums(["all", "incomplete", "complete"])
type Visibility = Infer<typeof VisibilityStruct>

function App() {
  const [todoInput, setTodoInput] = useState("")
  const [todos, setTodos] = useState<Todos>([])
  const [visibility, setVisibility] = useState<Visibility>("all")
  const [searchInput, setSearchInput] = useState("")
  const isFirstRender = useRef(true)

  useEffect(() => {
    get(TODOS_DB_KEY).then((todos) => {
      if (is(todos, TodosStruct)) {
        setTodos(todos)
      } else {
        console.warn("Unexpected todos in indexed db")
      }
    })

    get(VISIBILITY_DB_KEY).then((visibility) => {
      if (is(visibility, VisibilityStruct)) {
        setVisibility(visibility)
      } else {
        console.warn("Unexpected visibility in indexed db")
      }
    })

    isFirstRender.current = false
  }, [])

  useEffect(() => {
    if (!isFirstRender.current) {
      set(TODOS_DB_KEY, todos).catch((err) => console.error(err))
    }
  }, [todos])

  useEffect(() => {
    if (!isFirstRender.current) {
      set(VISIBILITY_DB_KEY, visibility).catch((err) => console.error(err))
    }
  }, [visibility])

  return (
    <div className="app">
      <header className="header">TODO app</header>

      <main className="app__main">
        <h1 className="app__title">This is a TODO app written with React</h1>
        <form
          className="add-todo-form"
          onSubmit={(event) => {
            event.preventDefault()
            const normalisedInput = todoInput.trim()

            if (normalisedInput.length === 0) {
              alert("What are you doing? Please enter a valid todo")
              setTodoInput(normalisedInput)
              return
            }

            setTodos((prevTodos) =>
              prevTodos.concat({
                id: Date.now(),
                name: todoInput,
                isInEditMode: false,
                isCompleted: false,
              }),
            )
            setTodoInput("")
          }}
        >
          <label className="add-todo-form__label">
            Add TODO
            <input
              onChange={(event) => {
                setTodoInput(event.target.value)
              }}
              type="text"
              placeholder="Type in your TODO"
              value={todoInput}
              required={true}
            />
          </label>
          <input type="submit" value="Add" />
        </form>

        <button
          className="button"
          onClick={() => {
            setTodos((prevTodos) =>
              [...prevTodos].sort((prev, next) => {
                if (prev.name < next.name) {
                  return -1
                }

                if (prev.name === next.name) {
                  return 0
                }

                return 1
              }),
            )
          }}
        >
          Sort todos
        </button>

        <label>
          <span>Show todos </span>
          <select
            value={visibility}
            onChange={(event) => {
              setVisibility(() => {
                switch (event.target.value) {
                  case "incomplete":
                    return "incomplete"

                  case "complete":
                    return "complete"

                  default:
                    return "all"
                }
              })
            }}
          >
            <option value="all">All</option>
            <option value="incomplete">Only incomplete</option>
            <option value="complete">Only complete</option>
          </select>
        </label>

        <label>
          <span>Search </span>
          <input
            type="search"
            onChange={(event) => {
              setSearchInput(event.target.value)
            }}
            value={searchInput}
          />
        </label>

        <ol className="todo-list">
          {todos
            .filter((todo) => {
              switch (visibility) {
                case "all":
                  return true

                case "incomplete":
                  return !todo.isCompleted

                case "complete":
                  return todo.isCompleted

                default:
                  return assertNever(visibility)
              }
            })
            .filter((todo) => {
              return todo.name
                .toLowerCase()
                .includes(searchInput.toLowerCase().trim())
            })
            .map((todo, todoIndex) => (
              <li key={todo.id}>
                <div className="todo-list-item">
                  {todo.isInEditMode ? (
                    <input
                      type="text"
                      value={todo.name}
                      onChange={(event) => {
                        setTodos((prevToDos) => {
                          return prevToDos.map((prevTodo) => {
                            if (prevTodo.id === todo.id) {
                              return {
                                ...prevTodo,
                                name: event.target.value,
                              }
                            }
                            return prevTodo
                          })
                        })
                      }}
                    />
                  ) : (
                    <div className="todo-list-item__text-container">
                      <span
                        className={`todo-list-item__text ${
                          todo.isCompleted
                            ? "todo-list-item__text--completed"
                            : ""
                        }`}
                      >
                        {todo.name}
                      </span>

                      <input
                        type="checkbox"
                        checked={todo.isCompleted}
                        onChange={(event) => {
                          setTodos((prevState) => {
                            return prevState.map((prevTodo) => {
                              if (prevTodo.id === todo.id) {
                                return {
                                  ...prevTodo,
                                  isCompleted: event.target.checked,
                                }
                              }
                              return prevTodo
                            })
                          })
                        }}
                      />
                    </div>
                  )}
                  <div className="todo-list-item__buttons">
                    <button
                      className="button"
                      onClick={() => {
                        setTodos((prevTodos) => {
                          return prevTodos.map((prevTodo) => {
                            if (prevTodo.id === todo.id) {
                              return {
                                ...prevTodo,
                                isInEditMode: !prevTodo.isInEditMode,
                              }
                            }

                            return prevTodo
                          })
                        })
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="button"
                      onClick={() => {
                        setTodos((prevTodos) => {
                          return prevTodos.filter((_, i) => {
                            return i !== todoIndex
                          })
                        })
                      }}
                    >
                      Delete
                    </button>

                    <button
                      className="button"
                      onClick={() => {
                        setTodos((prevTodos) =>
                          prevTodos
                            .slice(0, todoIndex + 1)
                            .concat({
                              id: Date.now(),
                              name: todo.name,
                              isInEditMode: false,
                              isCompleted: false,
                            })
                            .concat(prevTodos.slice(todoIndex + 1)),
                        )
                      }}
                    >
                      Copy
                    </button>

                    <button
                      className="button"
                      onClick={() => {
                        setTodos((prevTodos) =>
                          prevTodos
                            .slice(0, todoIndex)
                            .concat([prevTodos[todoIndex + 1], todo])
                            .concat(prevTodos.slice(todoIndex + 2)),
                        )
                      }}
                      aria-label="Move down"
                      disabled={todos.length === todoIndex + 1}
                    >
                      ⬇
                    </button>

                    <button
                      className="button"
                      onClick={() => {
                        setTodos((prevTodos) =>
                          prevTodos
                            .slice(0, todoIndex - 1)
                            .concat([todo, prevTodos[todoIndex - 1]])
                            .concat(prevTodos.slice(todoIndex + 1)),
                        )
                      }}
                      aria-label="Move up"
                      disabled={0 === todoIndex}
                    >
                      ⬆
                    </button>
                  </div>
                </div>
              </li>
            ))}
        </ol>
      </main>

      <footer className="footer app__footer">by Anxenomoon</footer>
    </div>
  )
}

export default App
