"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Play, Pause, Square, RotateCcw, Flag, Timer as TimerIcon, Watch } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils"; // Import cn

export default function TimerPage() {
    const { t } = useTranslation();

    return (
        <div className="p-4 space-y-4 pb-20">
            <h1 className="text-2xl font-bold">{t.tools.timer_title}</h1>

            <Tabs defaultValue="stopwatch" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="stopwatch" className="flex items-center gap-2">
                        <Watch className="h-4 w-4" />
                        {t.tools.stopwatch}
                    </TabsTrigger>
                    <TabsTrigger value="timer" className="flex items-center gap-2">
                        <TimerIcon className="h-4 w-4" />
                        {t.tools.timer}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="stopwatch">
                    <Stopwatch />
                </TabsContent>
                <TabsContent value="timer">
                    <Timer />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function Stopwatch() {
    const { t } = useTranslation();
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);
    const intervalRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime((prev) => prev + 10);
            }, 10);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const handleStart = () => setIsRunning(true);
    const handleStop = () => setIsRunning(false);
    const handleReset = () => {
        setIsRunning(false);
        setTime(0);
        setLaps([]);
    };
    const handleLap = () => {
        setLaps((prev) => [time, ...prev]);
    };

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.tools.stopwatch}</CardTitle>
                <CardDescription>{t.tools.timer_desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-6xl font-mono text-center tabular-nums tracking-wider py-8">
                    {formatTime(time)}
                </div>

                <div className="flex justify-center gap-4">
                    {!isRunning ? (
                        <Button onClick={handleStart} size="lg" className="w-32 bg-green-500 hover:bg-green-600">
                            <Play className="h-4 w-4 mr-2" />
                            {t.tools.start}
                        </Button>
                    ) : (
                        <Button onClick={handleStop} size="lg" className="w-32 bg-yellow-500 hover:bg-yellow-600">
                            <Pause className="h-4 w-4 mr-2" />
                            {t.tools.stop}
                        </Button>
                    )}

                    <Button onClick={handleLap} disabled={!isRunning} size="lg" variant="outline">
                        <Flag className="h-4 w-4 mr-2" />
                        {t.tools.lap}
                    </Button>

                    <Button onClick={handleReset} size="lg" variant="destructive">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {t.tools.reset}
                    </Button>
                </div>

                {laps.length > 0 && (
                    <div className="mt-6 border rounded-md overflow-hidden">
                        <div className="bg-muted p-2 font-medium text-center text-sm grid grid-cols-2">
                            <span>{t.tools.lap} No.</span>
                            <span>Time</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {laps.map((lapTime, index) => (
                                <div key={index} className="flex justify-between p-3 border-t text-sm grid grid-cols-2 text-center">
                                    <span className="text-muted-foreground">#{laps.length - index}</span>
                                    <span className="font-mono">{formatTime(lapTime)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function Timer() {
    const { t } = useTranslation();
    const [duration, setDuration] = useState({ hours: 0, minutes: 0, seconds: 0 }); // Store initial duration
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout>(null);
    const [initialTime, setInitialTime] = useState(0); // Store the total seconds for progress calc if needed

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1000) {
                        setIsFinished(true);
                        setIsRunning(false);
                        return 0;
                    }
                    return prev - 1000;
                });
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsFinished(true);
            setIsRunning(false);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [isRunning, timeLeft]);

    const handleStart = () => {
        if (timeLeft === 0) {
            const totalMs = (duration.hours * 3600 + duration.minutes * 60 + duration.seconds) * 1000;
            if (totalMs > 0) {
                setTimeLeft(totalMs);
                setInitialTime(totalMs);
                setIsRunning(true);
                setIsFinished(false);
            }
        } else {
            setIsRunning(true);
        }
    };

    const handlePause = () => setIsRunning(false);

    const handleReset = () => {
        setIsRunning(false);
        setIsFinished(false);
        setTimeLeft(0);
        // We do NOT reset duration inputs, so user can easily restart same timer
    };

    const handleInputChange = (field: keyof typeof duration, value: string) => {
        const num = parseInt(value) || 0;
        setDuration(prev => ({ ...prev, [field]: num }));
        // If we change input while timer is not running/finished, reset the timeLeft so 'Start' picks up new time
        if (!isRunning && timeLeft === 0 && !isFinished) {
            // do nothing, handleStart will calc
        } else if (!isRunning) {
            // If paused or finished, modifying inputs implies a reset usually, but let's just let user explicity reset
            // Actually UX pattern: if I change inputs, I probably want to start a NEW timer.
            // But let's just update the state.
        }
    }

    // Helper to format remaining time
    const formatTimeLeft = (ms: number) => {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    return (
        <Card className={cn(isFinished && "animate-pulse border-red-500 bg-red-50 dark:bg-red-950/20")}>
            <CardHeader>
                <CardTitle>{t.tools.timer}</CardTitle>
                <CardDescription>{t.tools.set_timer}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isFinished && (
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md text-center font-bold text-xl mb-4">
                        {t.tools.time_up}
                    </div>
                )}

                {timeLeft === 0 && !isFinished ? (
                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">{t.tools.hours}</label>
                            <Input
                                type="number"
                                min="0"
                                value={duration.hours}
                                onChange={(e) => handleInputChange('hours', e.target.value)}
                                className="text-center text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">{t.tools.minutes}</label>
                            <Input
                                type="number"
                                min="0"
                                max="59"
                                value={duration.minutes}
                                onChange={(e) => handleInputChange('minutes', e.target.value)}
                                className="text-center text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">{t.tools.seconds}</label>
                            <Input
                                type="number"
                                min="0"
                                max="59"
                                value={duration.seconds}
                                onChange={(e) => handleInputChange('seconds', e.target.value)}
                                className="text-center text-lg"
                            />
                        </div>
                    </div>
                ) : (
                    <div className={cn(
                        "text-6xl font-mono text-center tabular-nums py-8 tracking-wider",
                        timeLeft <= 10000 && timeLeft > 0 && "text-red-500 animate-pulse"
                    )}>
                        {formatTimeLeft(timeLeft)}
                    </div>
                )}


                <div className="flex justify-center gap-4">
                    {!isRunning && timeLeft === 0 && !isFinished ? (
                        <Button onClick={handleStart} size="lg" className="w-full bg-blue-500 hover:bg-blue-600">
                            <Play className="h-4 w-4 mr-2" />
                            {t.tools.start}
                        </Button>
                    ) : (
                        <>
                            {!isRunning || isFinished ? (
                                <Button onClick={handleStart} size="lg" className="w-32 bg-green-500 hover:bg-green-600">
                                    {isFinished ? <RotateCcw className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                    {isFinished ? t.tools.reset : t.tools.resume}
                                </Button>
                            ) : (
                                <Button onClick={handlePause} size="lg" className="w-32 bg-yellow-500 hover:bg-yellow-600">
                                    <Pause className="h-4 w-4 mr-2" />
                                    {t.tools.pause}
                                </Button>
                            )}

                            <Button onClick={handleReset} size="lg" variant="destructive">
                                <Square className="h-4 w-4 mr-2" />
                                {t.tools.reset}
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
