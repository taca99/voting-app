import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { rephrase } from "../lib/ai";

import { ethers } from "ethers";
import VotingAbi from "../contracts/voting.json";
const contractAddress = "0x44DF4db04e92a2190ba11De527a7bd60B70bF424";

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: "active" | "passed" | "rejected" | "pending";
  endDate: string;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  category: string;
}

const mockProposals: Proposal[] = [
  {
    id: "1",
    title: "Adoption of the minutes from the previous meeting.",
    description:
      "The minutes from the previous session are submitted for adoption without amendments.",
    status: "active",
    endDate: "2026-01-18",
    totalVotes: 3321,
    yesVotes: 2947,
    noVotes: 374,
    category: "Academic Administration and Planning",
  },
  {
    id: "2",
    title:
      "Extension of the exam registration deadline for the current exam session",
    description:
      "Allowing more students to complete their registrations on time.",
    status: "active",
    endDate: "2026-01-20",
    totalVotes: 892,
    yesVotes: 623,
    noVotes: 269,
    category: "Student Experience and Support",
  },
  {
    id: "3",
    title:
      "Rescheduling of the exam in E-Business due to a scheduling conflict",
    description:
      "Addressing the issue of simultaneous scheduling of multiple exams.",
    status: "pending",
    endDate: "2026-01-25",
    totalVotes: 0,
    yesVotes: 0,
    noVotes: 0,
    category: "Exam Scheduling and Logistics",
  },
  {
    id: "4",
    title: "Adoption of the financial plan for the 2025/2026 academic year",
    description:
      "Review and approval of the budget for faculty operations and student activities.",
    status: "passed",
    endDate: "2024-01-10",
    totalVotes: 2156,
    yesVotes: 1398,
    noVotes: 758,
    category: "Academic Administration and Planning ",
  },
];

const VotingDashboard = () => {
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // --- AI suggestion form state ---
  const [title, setTitle] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [rules, setRules] = useState("");

  const [reLang, setReLang] = useState<"sr" | "en">("sr");
  const [reBusy, setReBusy] = useState(false);

  const handleVoteOnChain = async (proposalId: number, choice: boolean) => {
    if (!window.ethereum) return alert("MetaMask is not installed!");

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // konekcija wallet-a
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      contractAddress,
      VotingAbi.abi,
      signer
    );

    try {
      const tx = await contract.vote(proposalId, choice);
      await tx.wait();

      toast({
        title: "Vote recorded",
        description: `Your vote for proposal ${proposalId} was successfully recorded on-chain.`,
      });

      setVotedProposals(new Set([...votedProposals, proposalId.toString()])); // odmah update UI
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem("ai_suggestion");
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      setTitle(s.title || "");
      setOpt1(s.options?.[0] || "");
      setOpt2(s.options?.[1] || "");
      setOpt3(s.options?.[2] || "");
      setRules(s.rules || "");
    } catch {}
    localStorage.removeItem("ai_suggestion");
  }, []);

  const clearForm = () => {
    setTitle("");
    setOpt1("");
    setOpt2("");
    setOpt3("");
    setRules("");
  };

  const handleRephraseTitle = async () => {
    setReBusy(true);
    try {
      const newTitle = await rephrase(
        title || "Da li podržavate temu?",
        reLang,
        "neutral",
        "short"
      );
      setTitle(newTitle);
      toast({
        title: "Title updated",
        description: "AI translated the question.",
        duration: 2000,
      });
    } catch (e: any) {
      toast({
        title: "AI error",
        description: e?.message || "Translate failed",
        variant: "destructive",
      });
    } finally {
      setReBusy(false);
    }
  };

  const handleVote = (proposalId: string, voteType: "yes" | "no") => {
    if (votedProposals.has(proposalId)) {
      toast({
        title: "Already Voted",
        description: "You have already cast your vote on this proposal.",
        variant: "destructive",
      });
      return;
    }
    setVotedProposals((prev) => new Set([...prev, proposalId]));
    toast({
      title: "Vote Cast Successfully!",
      description: `Your ${voteType.toUpperCase()} vote has been recorded on the blockchain.`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-success/20 text-success border-success/30",
      passed: "bg-primary/20 text-primary border-primary/30",
      rejected: "bg-destructive/20 text-destructive border-destructive/30",
      pending: "bg-warning/20 text-warning border-warning/30",
    };

    const icons = {
      active: <Clock className="w-3 h-3" />,
      passed: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
    };

    return (
      <Badge
        className={`${
          variants[status as keyof typeof variants]
        } flex items-center gap-1`}
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getVotePercentage = (yesVotes: number, totalVotes: number) => {
    return totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Participate in decisions that shape the future of Serbia.
          </h1>
          <p className="text-muted-foreground text-lg">
            Vote on initiatives affecting education, transport, IT, environment,
            and citizens’ well-being.
          </p>
        </div>

        {/* --- Create Ballot (AI suggestion) --- */}
        <Card className="p-6 card-glow bg-card border-border mb-8">
          <h2 className="text-2xl font-semibold text-card-foreground mb-4">
            Create Ballot (AI suggestion)
          </h2>

          <div className="grid gap-4">
            <label className="block text-sm mb-1 text-muted-foreground">
              Title
            </label>
            <input
              className="w-full border border-border rounded-md bg-background text-foreground p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ballot title"
            />

            <div className="mt-2 flex items-center gap-2">
              <select
                className="border border-border rounded-md bg-background text-foreground px-2 py-2"
                value={reLang}
                onChange={(e) => setReLang(e.target.value as "sr" | "en")}
              >
                <option value="sr">sr</option>
                <option value="en">en</option>
              </select>
              <Button
                variant="outline"
                onClick={handleRephraseTitle}
                disabled={reBusy}
              >
                {reBusy ? "Translating…" : "Translate"}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              Tip: select language and click “Translate” to convert the
              question.
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">
                  Option 1
                </label>
                <input
                  className="w-full border border-border rounded-md bg-background text-foreground p-2"
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  placeholder="e.g. Yes, approve"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">
                  Option 2
                </label>
                <input
                  className="w-full border border-border rounded-md bg-background text-foreground p-2"
                  value={opt2}
                  onChange={(e) => setOpt2(e.target.value)}
                  placeholder="e.g. No, reject"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">
                  Option 3
                </label>
                <input
                  className="w-full border border-border rounded-md bg-background text-foreground p-2"
                  value={opt3}
                  onChange={(e) => setOpt3(e.target.value)}
                  placeholder="e.g. Abstain"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 text-muted-foreground">
                Rules
              </label>
              <textarea
                className="w-full border border-border rounded-md bg-background text-foreground p-2"
                rows={3}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="One vote per user. Results are public after closing."
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  toast({
                    title: "Draft saved",
                    description:
                      "This is a UI-only demo action. Connect to backend/Web3 to persist.",
                  })
                }
              >
                Save Draft
              </Button>
              <Button variant="outline" onClick={clearForm}>
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Active Proposals", value: "3", trend: "+2 this week" },
            {
              label: "Your Votes",
              value: votedProposals.size.toString(),
              trend: "Keep participating!",
            },
            {
              label: "Participation Rate",
              value: "67%",
              trend: "+5% this month",
            },
            { label: "Next Deadline", value: "3 days", trend: "Proposal #1" },
          ].map((stat, index) => (
            <Card key={index} className="p-6 card-glow bg-card border-border">
              <div className="text-2xl font-bold text-card-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {stat.label}
              </div>
              <div className="text-xs text-primary">{stat.trend}</div>
            </Card>
          ))}
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          {mockProposals.map((proposal) => (
            <Card
              key={proposal.id}
              className="p-6 card-glow bg-card border-border"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-card-foreground">
                        {proposal.title}
                      </h3>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {proposal.category}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    {proposal.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Ends: {proposal.endDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {proposal.totalVotes} votes
                    </div>
                  </div>
                </div>

                <div className="lg:w-80">
                  {proposal.totalVotes > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-success">
                          Yes: {proposal.yesVotes}
                        </span>
                        <span className="text-destructive">
                          No: {proposal.noVotes}
                        </span>
                      </div>
                      <Progress
                        value={getVotePercentage(
                          proposal.yesVotes,
                          proposal.totalVotes
                        )}
                        className="h-2"
                      />
                      <div className="text-center text-xs text-muted-foreground mt-1">
                        {getVotePercentage(
                          proposal.yesVotes,
                          proposal.totalVotes
                        ).toFixed(1)}
                        % in favor
                      </div>
                    </div>
                  )}

                  {proposal.status === "active" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          handleVote(proposal.id, "yes"); // UI-only logika
                          handleVoteOnChain(Number(proposal.id), true); // blockchain
                        }}
                        disabled={votedProposals.has(proposal.id)}
                        className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                      >
                        Vote Yes
                      </Button>

                      <Button
                        onClick={() => {
                          handleVote(proposal.id, "no"); // UI-only logika
                          handleVoteOnChain(Number(proposal.id), false); // blockchain
                        }}
                        disabled={votedProposals.has(proposal.id)}
                        variant="outline"
                        className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                      >
                        Vote No
                      </Button>
                    </div>
                  )}

                  {votedProposals.has(proposal.id) && (
                    <div className="text-center text-sm text-primary mt-2">
                      ✓ Vote recorded on blockchain
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VotingDashboard;
