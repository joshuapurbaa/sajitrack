
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createIDBStorage } from './idb';
import { v4 as uuidv4 } from 'uuid';

export interface Recipe {
    id: string;
    name: string;
    difficulty: string;
    time: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    createdAt: string;
    isFavorite?: boolean;
}

interface RecipeState {
    recipes: Recipe[];
    addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
    removeRecipe: (id: string) => void;
    toggleFavorite: (id: string) => void;
}

export const useRecipeStore = create<RecipeState>()(
    persist(
        (set) => ({
            recipes: [],
            addRecipe: (recipe) => set((state) => ({
                recipes: [
                    { ...recipe, id: uuidv4(), createdAt: new Date().toISOString(), isFavorite: false },
                    ...state.recipes
                ]
            })),
            removeRecipe: (id) => set((state) => ({
                recipes: state.recipes.filter((r) => r.id !== id)
            })),
            toggleFavorite: (id) => set((state) => ({
                recipes: state.recipes.map((r) =>
                    r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
                )
            })),
        }),
        {
            name: 'recipe-storage',
            storage: createJSONStorage(() => createIDBStorage('recipes')),
        }
    )
);
