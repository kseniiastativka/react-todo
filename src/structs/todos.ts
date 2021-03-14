import { array, boolean, Infer, number, object, string } from "superstruct"

const Todo = object({
  id: number(),
  name: string(),
  isInEditMode: boolean(),
  isCompleted: boolean(),
})

export const TodosStruct = array(Todo)
export type Todos = Infer<typeof TodosStruct>
