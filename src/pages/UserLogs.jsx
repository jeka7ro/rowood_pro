import React, { useEffect, useMemo, useState } from "react";
import { UserLog } from "@/entities/UserLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, History } from "lucide-react";

export default function UserLogs() {
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const list = await UserLog.list("-created_date", 200).catch(() => []);
      if (alive) {
        setLogs(list || []);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (logs || []).filter(l =>
      !qq ||
      (l.action || "").toLowerCase().includes(qq) ||
      (l.details || "").toLowerCase().includes(qq) ||
      (l.user_id || "").toLowerCase().includes(qq) ||
      (l.target_user_id || "").toLowerCase().includes(qq)
    );
  }, [logs, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Jurnal Utilizatori</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtru</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Caută</div>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Acțiune, detalii, user id..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ultimele acțiuni</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Acțiune</TableHead>
                    <TableHead>Utilizator</TableHead>
                    <TableHead>Țintă</TableHead>
                    <TableHead>Detalii</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.created_date ? new Date(l.created_date).toLocaleString() : "-"}</TableCell>
                      <TableCell>{l.action}</TableCell>
                      <TableCell>{l.user_id || "-"}</TableCell>
                      <TableCell>{l.target_user_id || "-"}</TableCell>
                      <TableCell className="max-w-[420px] truncate" title={l.details || ""}>
                        {l.details || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nicio înregistrare.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}