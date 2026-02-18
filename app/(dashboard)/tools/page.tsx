"use client";

import Link from "next/link";
import { DollarSign, Timer, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function ToolsPage() {
    const { t } = useTranslation();

    const tools = [
        {
            href: "/tools/expenses",
            title: t.nav.expenses,
            description: t.tools.expenses_desc,
            icon: DollarSign,
            color: "text-green-500",
        },
        {
            href: "/tools/timer",
            title: t.tools.timer_title,
            description: t.tools.timer_desc,
            icon: Timer,
            color: "text-blue-500",
        },
    ];

    return (
        <div className="p-4 space-y-6 pb-24">
            <h1 className="text-2xl font-bold">{t.tools.title}</h1>

            <div className="grid gap-4 md:grid-cols-2">
                {tools.map((tool) => (
                    <Link key={tool.href} href={tool.href}>
                        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-2 hover:border-primary/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-semibold">
                                    {tool.title}
                                </CardTitle>
                                <tool.icon className={`h-6 w-6 ${tool.color}`} />
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm text-balance">
                                    {tool.description}
                                </CardDescription>
                                <div className="mt-4 flex items-center text-sm text-primary font-medium">
                                    Open <ArrowRight className="ml-1 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
