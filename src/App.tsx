import "./App.css"
import { useEffect, useRef, useState } from "react"
import { get, set } from "idb-keyval"
import { array, boolean, Infer, is, number, object, string } from "superstruct"

const TODOS_DB_KEY = "todos-v1"

const Todo = object({
  id: number(),
  name: string(),
  isInEditMode: boolean(),
})

const TodosStruct = array(Todo)

type Todos = Infer<typeof TodosStruct>

function App() {
  const [todoInput, setTodoInput] = useState("")
  const [todos, setTodos] = useState<Todos>([])
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      get(TODOS_DB_KEY).then((todos) => {
        if (is(todos, TodosStruct)) {
          setTodos(todos)
        }
      })
      isFirstRender.current = false
      return
    }

    set(TODOS_DB_KEY, todos).catch((err) => console.error(err))
  }, [todos])

  return (
    <div className="app">
      <header className="header">TODO app</header>

      <main className="app__main">
        <h1 className="app__title">This is a TODO app written with React</h1>
        <form
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
              }),
            )
            setTodoInput("")
          }}
        >
          <label>
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

        <ol>
          {todos.map((todo, todoIndex) => (
            <li key={todo.id}>
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
                todo.name
              )}

              <button
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
                ✎
              </button>

              <button
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
                onClick={() => {
                  setTodos((prevTodos) =>
                    prevTodos
                      .slice(0, todoIndex + 1)
                      .concat({
                        id: Date.now(),
                        name: todo.name,
                        isInEditMode: false,
                      })
                      .concat(prevTodos.slice(todoIndex + 1)),
                  )
                }}
              >
                Copy
              </button>

              <button
                onClick={() => {
                  setTodos((prevTodos) =>
                    prevTodos
                      .slice(0, todoIndex)
                      .concat([prevTodos[todoIndex + 1], todo])
                      .concat(prevTodos.slice(todoIndex + 2)),
                  )
                }}
                disabled={todos.length === todoIndex + 1}
              >
                ⬇️
              </button>

              <button
                onClick={() => {
                  setTodos((prevTodos) =>
                    prevTodos
                      .slice(0, todoIndex - 1)
                      .concat([todo, prevTodos[todoIndex - 1]])
                      .concat(prevTodos.slice(todoIndex + 1)),
                  )
                }}
                disabled={0 === todoIndex}
              >
                ⬆️
              </button>
            </li>
          ))}
        </ol>
      </main>

      <footer className="footer app__footer">by Anxenomoon</footer>
    </div>
  )
}

export default App
