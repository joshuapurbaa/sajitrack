"use client";

import { useState } from "react";
import { useInventoryStore } from "@/lib/store/useInventoryStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChefHat } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      setError("Please select at least one ingredient.");
      return;
    }

    setLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const response = await fetch("/api/ai/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: selectedIngredients }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recipes");
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setRecipes(data.recipes);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" /> AI Chef
        </h1>
        <p className="text-muted-foreground">Select ingredients to generate recipes with AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ingredient Selection */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Pantry Ingredients</CardTitle>
            <CardDescription>Select what you want to use.</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your pantry is empty.</p>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                "Generate Recipes"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Recipe Display */}
        <div className="md:col-span-2 space-y-4">
          {error && (
            <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          {recipes.length > 0 && (
            <div className="grid gap-4">
              {recipes.map((recipe, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{recipe.name}</CardTitle>
                      <Badge variant="secondary">{recipe.difficulty}</Badge>
                    </div>
                    <CardDescription>{recipe.time} • {recipe.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Ingredients</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Instructions</h4>
                      <ol className="list-decimal pl-5 text-sm space-y-1">
                        {recipe.instructions.map((step, i) => (
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
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <ChefHat className="h-10 w-10 mb-2 opacity-20" />
              <p>Select ingredients and click generate to see recipes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
