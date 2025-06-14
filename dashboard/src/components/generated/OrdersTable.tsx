"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Order {
  url: string;
  status: "Analyzing" | "Analyzed" | "Failed";
}

export interface OrdersTableProps {
  orders: Order[];
  onShowResults: (url: string) => void;
}

export default function OrdersTable({ orders, onShowResults }: OrdersTableProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="orders-heading">
      <h2 id="orders-heading" className="text-2xl font-bold mb-4">
        Ongoing Orders
      </h2>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tweet URL</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{order.url}</TableCell>
                <TableCell>
                  {order.status === 'Analyzed' ? (
                    <Button variant="outline" size="sm" onClick={() => onShowResults(order.url)}>
                      Show Results
                    </Button>
                  ) : (
                    <Badge variant={order.status === "Analyzing" ? "default" : "destructive"}>
                      {order.status}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
} 