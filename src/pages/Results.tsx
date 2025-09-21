import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, CheckCircle, XCircle, Clock } from "lucide-react";

const Results = () => {
  const proposalResults = [
    {
      id: "1",
      title: "Implement AI-Powered Governance Assistant",
      status: "active",
      totalVotes: 1247,
      yesVotes: 789,
      noVotes: 458,
      endDate: "2024-01-15",
      category: "Technology"
    },
    {
      id: "2",
      title: "Increase Community Treasury Allocation", 
      status: "active",
      totalVotes: 892,
      yesVotes: 623,
      noVotes: 269,
      endDate: "2024-01-20",
      category: "Treasury"
    },
    {
      id: "4",
      title: "Decentralized Identity Verification",
      status: "passed",
      totalVotes: 2156,
      yesVotes: 1398,
      noVotes: 758,
      endDate: "2024-01-10",
      category: "Security"
    },
    {
      id: "5",
      title: "Multi-sig Wallet Integration",
      status: "rejected",
      totalVotes: 1834,
      yesVotes: 624,
      noVotes: 1210,
      endDate: "2024-01-08",
      category: "Security"
    }
  ];

  const chartData = proposalResults.map(proposal => ({
    name: proposal.title.substring(0, 20) + "...",
    yes: proposal.yesVotes,
    no: proposal.noVotes,
    total: proposal.totalVotes
  }));

  const categoryData = [
    { name: "Technology", value: 1247, color: "hsl(262 83% 58%)" },
    { name: "Treasury", value: 892, color: "hsl(242 91% 69%)" },
    { name: "Security", value: 3990, color: "hsl(142 76% 36%)" },
    { name: "Infrastructure", value: 0, color: "hsl(38 92% 50%)" }
  ];

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
          <h1 className="text-4xl font-bold mb-4 gradient-text">Voting Results</h1>
          <p className="text-muted-foreground text-lg">
            Real-time voting results and governance analytics powered by blockchain transparency.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: "Total Proposals", 
              value: "47", 
              change: "+12%",
              icon: <TrendingUp className="w-5 h-5" />
            },
            { 
              label: "Total Votes Cast", 
              value: "10,247", 
              change: "+34%",
              icon: <Users className="w-5 h-5" />
            },
            { 
              label: "Proposals Passed", 
              value: "23", 
              change: "49%",
              icon: <CheckCircle className="w-5 h-5" />
            },
            { 
              label: "Active Voters", 
              value: "2,341", 
              change: "+18%",
              icon: <Users className="w-5 h-5" />
            }
          ].map((stat, index) => (
            <Card key={index} className="p-6 card-glow bg-card border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-primary">{stat.icon}</div>
                <div className="text-sm text-success">
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-card-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Voting Results Bar Chart */}
          <Card className="p-6 card-glow bg-card border-border">
            <h3 className="text-xl font-semibold mb-4 text-card-foreground">
              Proposal Voting Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="yes" fill="hsl(var(--success))" name="Yes Votes" />
                <Bar dataKey="no" fill="hsl(var(--destructive))" name="No Votes" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Distribution Pie Chart */}
          <Card className="p-6 card-glow bg-card border-border">
            <h3 className="text-xl font-semibold mb-4 text-card-foreground">
              Votes by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Detailed Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Detailed Results</h2>
          
          {proposalResults.map((proposal) => (
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
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Ended: {proposal.endDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {proposal.totalVotes} votes
                    </div>
                  </div>
                </div>

                <div className="lg:w-80">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-success">Yes: {proposal.yesVotes} ({getVotePercentage(proposal.yesVotes, proposal.totalVotes).toFixed(1)}%)</span>
                      <span className="text-destructive">No: {proposal.noVotes} ({(100 - getVotePercentage(proposal.yesVotes, proposal.totalVotes)).toFixed(1)}%)</span>
                    </div>
                    <Progress 
                      value={getVotePercentage(proposal.yesVotes, proposal.totalVotes)} 
                      className="h-3"
                    />
                    <div className="text-center text-sm font-medium">
                      {proposal.status === "passed" && (
                        <span className="text-success">✓ Proposal Passed</span>
                      )}
                      {proposal.status === "rejected" && (
                        <span className="text-destructive">✗ Proposal Rejected</span>
                      )}
                      {proposal.status === "active" && (
                        <span className="text-warning">⏳ Voting in Progress</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;