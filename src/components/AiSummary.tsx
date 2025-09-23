import { useState } from "react";
import { summarize, type SummaryResponse } from "../lib/ai";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AiSummary() {
  // Podrazumevane vrednosti (možeš promeniti po potrebi ili kasnije spojiti sa realnim rezultatima)
  const [opt1, setOpt1] = useState("Da, usvojiti");
  const [opt2, setOpt2] = useState("Ne, odbiti");
  const [opt3, setOpt3] = useState("Uzdržan");
  const [c1, setC1] = useState("12");
  const [c2, setC2] = useState("9");
  const [c3, setC3] = useState("1");
  const [turnout, setTurnout] = useState("68");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState<SummaryResponse | null>(null);

  const run = async () => {
    setLoading(true);
    setErr("");
    setData(null);
    try {
      const options = [opt1, opt2, opt3];
      const counts = [Number(c1) || 0, Number(c2) || 0, Number(c3) || 0];
      const turnoutNum = turnout ? Number(turnout) : undefined;
      const res = await summarize(options, counts, turnoutNum);
      setData(res);
    } catch (e: any) {
      setErr(e?.message || "AI error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl w-full bg-card text-card-foreground border-border">
      <CardHeader>
        <CardTitle>AI summary (rezime rezultata)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ulazi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-foreground">Opcija 1</Label>
            <Input className="bg-background text-foreground" value={opt1} onChange={(e) => setOpt1(e.target.value)} />
            <Input className="bg-background text-foreground" value={c1} onChange={(e) => setC1(e.target.value)} placeholder="Broj glasova" />
          </div>
          <div className="space-y-1">
            <Label className="text-foreground">Opcija 2</Label>
            <Input className="bg-background text-foreground" value={opt2} onChange={(e) => setOpt2(e.target.value)} />
            <Input className="bg-background text-foreground" value={c2} onChange={(e) => setC2(e.target.value)} placeholder="Broj glasova" />
          </div>
          <div className="space-y-1">
            <Label className="text-foreground">Opcija 3</Label>
            <Input className="bg-background text-foreground" value={opt3} onChange={(e) => setOpt3(e.target.value)} />
            <Input className="bg-background text-foreground" value={c3} onChange={(e) => setC3(e.target.value)} placeholder="Broj glasova" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-foreground">Izlaznost (%)</Label>
            <Input className="bg-background text-foreground" value={turnout} onChange={(e) => setTurnout(e.target.value)} />
          </div>
          <Button onClick={run} disabled={loading}>{loading ? "Generišem…" : "AI summary"}</Button>
        </div>

        {err && <div className="text-destructive text-sm">{err}</div>}

        {data && (
          <div className="space-y-2">
            <Separator />
            <div className="text-sm text-muted-foreground">Rezime</div>
            <p className="text-sm">{data.summary}</p>
            {data.key_takeaways?.length ? (
              <>
                <div className="text-sm text-muted-foreground mt-2">Key takeaways</div>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {data.key_takeaways.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
