"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );

        setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    };

    if (isStandalone) {
        return null; // Don't show if already installed
    }

    if (isIOS) {
        return (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50 md:hidden">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        To install this app on iOS, tap the share button and select "Add to
                        Home Screen"
                    </p>
                    <Button variant="ghost" size="icon" onClick={() => setIsIOS(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    if (!deferredPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:right-4 md:left-auto md:w-96">
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Install App</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeferredPrompt(null)}
                            className="h-6 w-6"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardDescription>
                        Install SajiTrack for a better experience
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleInstallClick} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Install
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
