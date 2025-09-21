import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    title: "National Plastic and Packaging Recycling Program",
    description: "Proposal to introduce reverse vending machines in all major cities, allowing citizens to return plastic and packaging materials in exchange for vouchers as incentives for recycling.",
    status: "active",
    endDate: "2026-01-18",
    totalVotes: 3321,
    yesVotes: 2947,
    noVotes: 374,
    category: "Environment / Recycling"
  },
  {
    id: "2", 
    title: "Municipal Animal Shelter Initiative",
    description: "Proposal to establish at least one public or registered animal shelter in every municipality to ensure proper care and protection for stray and abandoned animals.",
    status: "active",
    endDate: "2026-01-20",
    totalVotes: 892,
    yesVotes: 623,
    noVotes: 269,
    category: "Animal Welfare / Environment"
  },
  {
    id: "3",
    title: "National Digital Skills Development Program",
    description: "Proposal to implement nationwide digital skills training for students and professionals, covering programming, cybersecurity, data analysis, and artificial intelligence to strengthen Serbia’s IT workforce.",
    status: "pending",
    endDate: "2026-01-25",
    totalVotes: 0,
    yesVotes: 0,
    noVotes: 0,
    category: "IT / Education"
  },
  {
    id: "4",
    title: "National Renewable Energy Initiative",
    description: "Proposal to increase the share of renewable energy sources in Serbia’s energy mix to 25% by 2030, including solar, wind, and hydroelectric projects.",
    status: "passed",
    endDate: "2024-01-10",
    totalVotes: 2156,
    yesVotes: 1398,
    noVotes: 758,
    category: "Energy/Environment "
  }
];

const VotingDashboard = () => {
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleVote = (proposalId: string, voteType: "yes" | "no") => {
    if (votedProposals.has(proposalId)) {
      toast({
        title: "Already Voted",
        description: "You have already cast your vote on this proposal.",
        variant: "destructive"
      });
      return;
    }

    setVotedProposals(prev => new Set([...prev, proposalId]));
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
      pending: "bg-warning/20 text-warning border-warning/30"
    };
    
    const icons = {
      active: <Clock className="w-3 h-3" />,
      passed: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} flex items-center gap-1`}>
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
          <h1 className="text-4xl font-bold mb-4 gradient-text">Participate in decisions that shape the future of Serbia.</h1>
          <p className="text-muted-foreground text-lg">
           Vote on initiatives affecting education, transport, IT, environment, and citizens’ well-being.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Active Proposals", value: "3", trend: "+2 this week" },
            { label: "Your Votes", value: votedProposals.size.toString(), trend: "Keep participating!" },
            { label: "Participation Rate", value: "67%", trend: "+5% this month" },
            { label: "Next Deadline", value: "3 days", trend: "Proposal #1" }
          ].map((stat, index) => (
            <Card key={index} className="p-6 card-glow bg-card border-border">
              <div className="text-2xl font-bold text-card-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {stat.label}
              </div>
              <div className="text-xs text-primary">
                {stat.trend}
              </div>
            </Card>
          ))}
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          {mockProposals.map((proposal) => (
            <Card key={proposal.id} className="p-6 card-glow bg-card border-border">
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
                        <span className="text-success">Yes: {proposal.yesVotes}</span>
                        <span className="text-destructive">No: {proposal.noVotes}</span>
                      </div>
                      <Progress 
                        value={getVotePercentage(proposal.yesVotes, proposal.totalVotes)} 
                        className="h-2"
                      />
                      <div className="text-center text-xs text-muted-foreground mt-1">
                        {getVotePercentage(proposal.yesVotes, proposal.totalVotes).toFixed(1)}% in favor
                      </div>
                    </div>
                  )}
                  
                  {proposal.status === "active" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleVote(proposal.id, "yes")}
                        disabled={votedProposals.has(proposal.id)}
                        className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                      >
                        Vote Yes
                      </Button>
                      <Button
                        onClick={() => handleVote(proposal.id, "no")}
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