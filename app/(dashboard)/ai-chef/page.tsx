"use client";

import Lottie from "lottie-react";
import cookingAnimation from "../../../public/cooking.json";
import { useState } from "react";
import { useInventoryStore } from "@/lib/store/useInventoryStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useRecipeStore } from "@/lib/store/useRecipeStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChefHat, Heart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface Recipe {
  name: string;
  difficulty: string;
  time: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export default function AIChefPage() {
  const { items } = useInventoryStore();
  const { t } = useTranslation();
  const { language } = useSettingsStore();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleIngredient = (name: string) => {
    setSelectedIngredients(prev =>
      prev.includes(name)
        ? prev.filter(i => i !== name)
        : [...prev, name]
    );
  };

  const handleGenerateRecipes = async () => {
    if (selectedIngredients.length === 0) {
      setError(t.ai_chef.select_ingredients_error);
      return;
    }

    setLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const response = await fetch("/api/ai/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          language
        }),
      });

      if (!response.ok) {
        throw new Error(t.ai_chef.generic_error);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      console.log("AIChefPage received recipes:", data.recipes);
      setRecipes(data.recipes);
    } catch (err) {
      console.error(err);
      setError(t.ai_chef.generic_error);
    } finally {
      setLoading(false);
    }
  };


  const { addRecipe, recipes: savedRecipes, removeRecipe, toggleFavorite } = useRecipeStore();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const handleSaveRecipe = (recipe: Recipe) => {
    addRecipe(recipe);
  };

  const isRecipeSaved = (recipeName: string) => {
    return savedRecipes.some(r => r.name === recipeName);
  };

  const filteredSavedRecipes = showFavoritesOnly
    ? savedRecipes.filter(r => r.isFavorite)
    : savedRecipes;

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" /> {t.ai_chef.title}
        </h1>
        <p className="text-muted-foreground">{t.ai_chef.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ingredient Selection */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{t.ai_chef.pantry_ingredients}</CardTitle>
            <CardDescription>{t.ai_chef.select_desc}</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.ai_chef.pantry_empty}</p>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item._id || item.localId} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ing-${item.name}`}
                        checked={selectedIngredients.includes(item.name)}
                        onCheckedChange={() => toggleIngredient(item.name)}
                      />
                      <label
                        htmlFor={`ing-${item.name}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {item.name} <span className="text-xs text-muted-foreground">({item.quantity} {item.unit})</span>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleGenerateRecipes}
              disabled={loading || selectedIngredients.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.ai_chef.generating}
                </>
              ) : (
                t.ai_chef.generate
              )}
            </Button>
          </CardFooter>
        </Card>


        {/* Recipe Display */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-4">
            {error && (
              <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-48 h-48">
                  <Lottie animationData={cookingAnimation} loop={true} />
                </div>
                <p className="text-muted-foreground mt-4 animate-pulse">{t.ai_chef.generating}</p>
              </div>
            )}

            {!loading && recipes.length > 0 && (
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Generated Recipes
                </h3>
                {recipes.map((recipe, index) => (
                  <Card key={index} className="overflow-hidden border-primary/20 bg-primary/5">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle>{recipe.name}</CardTitle>
                          <CardDescription>{recipe.time} • {recipe.description}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant="secondary">{recipe.difficulty}</Badge>
                          {isRecipeSaved(recipe.name) ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Saved</Badge>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleSaveRecipe(recipe)}>
                              {t.common.save}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">{t.ai_chef.ingredients}</h4>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {recipe.ingredients?.map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">{t.ai_chef.instructions}</h4>
                        <ol className="list-decimal pl-5 text-sm space-y-1">
                          {recipe.instructions?.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && recipes.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <ChefHat className="h-8 w-8 mb-2 opacity-20" />
                <p>{t.ai_chef.no_recipes}</p>
              </div>
            )}
          </div>

          {/* Saved Recipes Section */}
          {(savedRecipes.length > 0) && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Saved Recipes ({filteredSavedRecipes.length})</h3>
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="gap-2"
                >
                  <Heart className={`h-4 w-4 ${showFavoritesOnly ? "fill-white" : ""}`} />
                  Favorites
                </Button>
              </div>

              {filteredSavedRecipes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No favorite recipes found.</p>
              ) : (
                <div className="grid gap-4">
                  {filteredSavedRecipes.map((recipe) => (
                    <Card key={recipe.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle>{recipe.name}</CardTitle>
                            <CardDescription>{recipe.time} • {recipe.description}</CardDescription>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <div className="flex gap-2">
                              <Badge variant="secondary">{recipe.difficulty}</Badge>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => toggleFavorite(recipe.id)}
                              >
                                <Heart
                                  className={`h-4 w-4 ${recipe.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                                />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              onClick={() => removeRecipe(recipe.id)}
                            >
                              {t.common.delete}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">{t.ai_chef.ingredients}</h4>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {recipe.ingredients?.map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">{t.ai_chef.instructions}</h4>
                          <ol className="list-decimal pl-5 text-sm space-y-1">
                            {recipe.instructions?.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
