import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface AnalyticsData {
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  study: string;
  interests: string;
  lastRemainder: string;
  followUp: string;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    topState: "",
    topInterest: "",
    topStudy: "",
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        "https://docs.google.com/spreadsheets/d/1TU93SnjbyWffcUas3nl2r6B0wQhOZrc_IAPvLDlNIDM/export?format=csv"
      );
      const csvText = await response.text();
      const parsed = parseCSV(csvText);
      setData(parsed);
      calculateStats(parsed);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error loading analytics",
        description: "Failed to fetch data from Google Sheets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csv: string): AnalyticsData[] => {
    const lines = csv.split("\n");
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      // Split by comma but handle quoted values
      const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''));
      
      // Columns: Name, Gmail, Ph no, State, Study, Intrests, last remainder, follow up
      return {
        name: values[0] || "",
        email: values[1] || "",
        phone: values[2] || "",
        state: values[3] || "",
        study: values[4] || "",
        interests: values[5] || "",
        lastRemainder: values[6] || "",
        followUp: values[7] || "",
        timestamp: new Date().toISOString(),
      };
    });
  };

  const calculateStats = (data: AnalyticsData[]) => {
    const totalUsers = data.length;
    
    const indianStatesMap: Record<string, string> = {
      'ap': 'Andhra Pradesh', 'ar': 'Arunachal Pradesh', 'as': 'Assam', 'br': 'Bihar',
      'cg': 'Chhattisgarh', 'ga': 'Goa', 'gj': 'Gujarat', 'hr': 'Haryana',
      'hp': 'Himachal Pradesh', 'jh': 'Jharkhand', 'ka': 'Karnataka', 'kl': 'Kerala',
      'mp': 'Madhya Pradesh', 'mh': 'Maharashtra', 'mn': 'Manipur', 'ml': 'Meghalaya',
      'mz': 'Mizoram', 'nl': 'Nagaland', 'or': 'Odisha', 'pb': 'Punjab',
      'rj': 'Rajasthan', 'sk': 'Sikkim', 'tn': 'Tamil Nadu', 'tg': 'Telangana',
      'tr': 'Tripura', 'up': 'Uttar Pradesh', 'uk': 'Uttarakhand', 'wb': 'West Bengal',
      'dl': 'Delhi', 'jk': 'Jammu & Kashmir', 'la': 'Ladakh'
    };
    
    // Count frequencies with proper state names
    const stateCounts = data.reduce((acc, item) => {
      if (item.state) {
        const stateKey = item.state.toLowerCase();
        const stateName = indianStatesMap[stateKey] || item.state;
        acc[stateName] = (acc[stateName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const interestCounts = data.reduce((acc, item) => {
      if (item.interests) {
        acc[item.interests] = (acc[item.interests] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const studyCounts = data.reduce((acc, item) => {
      if (item.study) {
        acc[item.study] = (acc[item.study] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topState = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const topInterest = Object.entries(interestCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const topStudy = Object.entries(studyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    setStats({ totalUsers, topState, topInterest, topStudy });
  };

  // Map of state codes to full names for Indian states
  const indianStates: Record<string, string> = {
    'ap': 'Andhra Pradesh',
    'ar': 'Arunachal Pradesh',
    'as': 'Assam',
    'br': 'Bihar',
    'cg': 'Chhattisgarh',
    'ga': 'Goa',
    'gj': 'Gujarat',
    'hr': 'Haryana',
    'hp': 'Himachal Pradesh',
    'jh': 'Jharkhand',
    'ka': 'Karnataka',
    'kl': 'Kerala',
    'mp': 'Madhya Pradesh',
    'mh': 'Maharashtra',
    'mn': 'Manipur',
    'ml': 'Meghalaya',
    'mz': 'Mizoram',
    'nl': 'Nagaland',
    'or': 'Odisha',
    'pb': 'Punjab',
    'rj': 'Rajasthan',
    'sk': 'Sikkim',
    'tn': 'Tamil Nadu',
    'tg': 'Telangana',
    'tr': 'Tripura',
    'up': 'Uttar Pradesh',
    'uk': 'Uttarakhand',
    'wb': 'West Bengal',
    'dl': 'Delhi',
    'jk': 'Jammu & Kashmir',
    'la': 'Ladakh',
    'ld': 'Lakshadweep',
    'py': 'Puducherry',
    'an': 'Andaman & Nicobar',
    'ch': 'Chandigarh',
    'dh': 'Dadra & Nagar Haveli',
    'dd': 'Daman & Diu',
  };

  const getStateChartData = () => {
    const stateCounts = data.reduce((acc, item) => {
      if (item.state) {
        const stateKey = item.state.toLowerCase();
        const stateName = indianStates[stateKey] || item.state;
        acc[stateName] = (acc[stateName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stateCounts)
      .map(([state, count]) => ({ state, registrations: count }))
      .sort((a, b) => b.registrations - a.registrations);
  };

  const getActiveUsersData = () => {
    return [{
      name: "Users",
      total: data.length,
      active: data.filter(d => d.followUp).length
    }];
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Registration Analytics
        </h2>
        <p className="text-muted-foreground">
          Real-time insights from webinar registrations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total users registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top State</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topState}</div>
            <p className="text-xs text-muted-foreground">Most registrations from</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Interest</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topInterest}</div>
            <p className="text-xs text-muted-foreground">Most popular interest</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Field</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topStudy}</div>
            <p className="text-xs text-muted-foreground">Most common study field</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* State-wise Registrations Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Registrations by Indian State</CardTitle>
            <CardDescription>State-wise distribution across India</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getStateChartData()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="state" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="registrations" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Total Users vs Active Users */}
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Total users vs users with follow-up</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getActiveUsersData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Users" />
                <Bar dataKey="active" fill="hsl(var(--accent))" name="Active Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Complete registration information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">State</th>
                  <th className="text-left py-3 px-4 font-medium">Field of Study</th>
                  <th className="text-left py-3 px-4 font-medium">Interest</th>
                  <th className="text-left py-3 px-4 font-medium">Last Remainder</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-secondary/50">
                    <td className="py-3 px-4">{row.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{row.email}</td>
                    <td className="py-3 px-4">{row.state}</td>
                    <td className="py-3 px-4">{row.study}</td>
                    <td className="py-3 px-4">{row.interests}</td>
                    <td className="py-3 px-4 text-sm">{row.lastRemainder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
