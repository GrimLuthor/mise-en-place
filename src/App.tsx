import { Routes, Route } from 'react-router-dom'
import Gallery from './pages/Gallery'
import RecipeDetail from './pages/RecipeDetail'
import RecipeEdit from './pages/RecipeEdit'
import CookingMode from './pages/CookingMode'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Gallery />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/recipe/:id/edit" element={<RecipeEdit />} />
      <Route path="/new" element={<RecipeEdit />} />
      <Route path="/recipe/:id/cook" element={<CookingMode />} />
    </Routes>
  )
}
