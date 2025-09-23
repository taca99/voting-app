import { useNavigate } from "react-router-dom";


import { useState } from "react";
import { suggestBallot, type SuggestResponse } from "../lib/ai";

// shadcn/ui
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AiSuggest(props: { onInsert?: (s: SuggestResponse) => void }) {
  const [topic, setTopic] = useState("Budžet studentskog doma 2025");
  const [lang, setLang] = useState<"sr" | "en">("sr");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SuggestResponse | null>(null);
  const [err, setErr] = useState("");
  const navigate = useNavigate();


  const run = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await suggestBallot(topic, lang);
      setData(res);
    } catch (e: any) {
      setErr(e?.message || "AI error");
    } finally {
      setLoading(false);
    }
  };

  const copyJSON = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

const insertToForm = () => {
  if (!data) return;
  // snimi AI predlog (čitaćemo ga na Dashboard stranici)
  localStorage.setItem("ai_suggestion", JSON.stringify(data));
  // idi na formu (Dashboard)
  navigate("/dashboard");
};

  return (
    <Card className="max-w-2xl w-full bg-card text-card-foreground border-border">
      <CardHeader>
        <CardTitle>AI predlog glasanja</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ulazni parametri */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <div className="space-y-1">
            <Label htmlFor="topic" className="text-foreground">Tema</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Tema glasanja"
              className="bg-background text-foreground placeholder:text-muted-foreground border-border"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-foreground">Jezik</Label>
            <Select value={lang} onValueChange={(v) => setLang(v as "sr" | "en")}>
              <SelectTrigger className="w-[90px] bg-background text-foreground border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sr">sr</SelectItem>
                <SelectItem value="en">en</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={run} disabled={loading} className="whitespace-nowrap">
            {loading ? "Generišem…" : "AI predlog"}
          </Button>
        </div>

        {err && <div className="text-destructive text-sm">{err}</div>}

        {/* Rezultat */}
        {data && (
          <div className="space-y-2">
            <Separator />
            <div className="text-sm text-muted-foreground">Rezultat</div>
            <pre className="whitespace-pre-wrap rounded-xl border border-border bg-background text-foreground p-3 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyJSON}>Copy JSON</Button>
              <Button variant="secondary" onClick={insertToForm}>Ubaci u formu</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
