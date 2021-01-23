import "./App.css"
import { useState } from "react"

function App() {
  const [todoInput, setTodoInput] = useState("")
  const [todos, setTodos] = useState<
    { id: number; name: string; isInEditMode: boolean }[]
  >([])

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
            </li>
          ))}
        </ol>
      </main>

      <footer className="footer app__footer">by Anxenomoon</footer>
    </div>
  )
}

export default App
