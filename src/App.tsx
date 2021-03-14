import "./App.css"
import { useEffect, useRef, useState } from "react"
import { get, set } from "idb-keyval"
import { enums, Infer, is } from "superstruct"
import { assertNever } from "./utils/assertNever"
import { Todos, TodosStruct } from "./structs/todos"
import { TodoList } from "./TodoList"

const TODOS_DB_KEY = "todos-v1"
const VISIBILITY_DB_KEY = "visibility-v1"

const VisibilityStruct = enums(["all", "incomplete", "complete"])
type Visibility = Infer<typeof VisibilityStruct>

function App() {
  const [todoInput, setTodoInput] = useState("")
  const [todos, setTodos] = useState<Todos>([])
  const [visibility, setVisibility] = useState<Visibility>("all")
  const [searchInput, setSearchInput] = useState("")
  const isFirstRender = useRef(true)

  const filteredTodos = todos
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
      return todo.name.toLowerCase().includes(searchInput.toLowerCase().trim())
    })

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

        <TodoList
          onComplete={(id, isCompleted) => {
            setTodos((prevState) => {
              return prevState.map((prevTodo) => {
                if (prevTodo.id === id) {
                  return {
                    ...prevTodo,
                    isCompleted,
                  }
                }
                return prevTodo
              })
            })
          }}
          onEdit={(id, name) => {
            setTodos((prevToDos) => {
              return prevToDos.map((prevTodo) => {
                if (prevTodo.id === id) {
                  return { ...prevTodo, name }
                }
                return prevTodo
              })
            })
          }}
          onEditModeToggle={(id: number) => {
            setTodos((prevTodos) => {
              return prevTodos.map((prevTodo) => {
                if (prevTodo.id === id) {
                  return {
                    ...prevTodo,
                    isInEditMode: !prevTodo.isInEditMode,
                  }
                }

                return prevTodo
              })
            })
          }}
          onDelete={(index) => {
            setTodos((prevTodos) => {
              return prevTodos.filter((_, i) => {
                return i !== index
              })
            })
          }}
          onCopy={(index, name) => {
            setTodos((prevTodos) =>
              prevTodos
                .slice(0, index + 1)
                .concat({
                  id: Date.now(),
                  name,
                  isInEditMode: false,
                  isCompleted: false,
                })
                .concat(prevTodos.slice(index + 1)),
            )
          }}
          onMoveDown={(index) => {
            setTodos((prevTodos) =>
              prevTodos
                .slice(0, index)
                .concat([prevTodos[index + 1], prevTodos[index]])
                .concat(prevTodos.slice(index + 2)),
            )
          }}
          onMoveUp={(index) => {
            setTodos((prevTodos) =>
              prevTodos
                .slice(0, index - 1)
                .concat([prevTodos[index], prevTodos[index - 1]])
                .concat(prevTodos.slice(index + 1)),
            )
          }}
          todos={filteredTodos}
        />
      </main>

      <footer className="footer app__footer">by Anxenomoon</footer>
    </div>
  )
}

export default App
