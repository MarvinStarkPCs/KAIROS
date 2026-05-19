import { TrendingUp, BarChart3, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { CustomTooltip, CustomPieTooltip } from '../charts';
import { STATUS_COLORS, CHART_COLORS } from '../constants';
import type { MonthlyRevenueItem, StatusDistributionItem, RevenueByProgramItem, PaymentMethodItem } from '../types';

interface Props {
    monthlyRevenue: MonthlyRevenueItem[];
    statusDistribution: StatusDistributionItem[];
    revenueByProgram: RevenueByProgramItem[];
    paymentMethodBreakdown: PaymentMethodItem[];
}

const formatYAxis = (v: number) =>
    v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}k`;

const EmptyChart = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Icon className="mb-4 h-12 w-12 opacity-50" />
        <p>{text}</p>
    </div>
);

export default function ChartsSection({
    monthlyRevenue,
    statusDistribution,
    revenueByProgram,
    paymentMethodBreakdown,
}: Props) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Revenue */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        Ingresos Mensuales
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {monthlyRevenue.length === 0 ? (
                        <EmptyChart icon={BarChart3} text="No hay datos de ingresos para este periodo" />
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        Distribución por Estado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {statusDistribution.length === 0 ? (
                        <EmptyChart icon={BarChart3} text="No hay datos para este periodo" />
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={statusDistribution} dataKey="count" nameKey="label" innerRadius={60} outerRadius={100} paddingAngle={2}>
                                    {statusDistribution.map((entry) => (
                                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Revenue by Program */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        Ingresos por Programa
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {revenueByProgram.length === 0 ? (
                        <EmptyChart icon={BarChart3} text="No hay datos por programa para este periodo" />
                    ) : (
                        <ResponsiveContainer width="100%" height={Math.max(200, revenueByProgram.length * 50)}>
                            <BarChart data={revenueByProgram} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis type="number" tickFormatter={formatYAxis} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                                <YAxis dataKey="program_name" type="category" width={150} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        Métodos de Pago
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {paymentMethodBreakdown.length === 0 ? (
                        <EmptyChart icon={CreditCard} text="No hay datos de métodos de pago para este periodo" />
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={paymentMethodBreakdown} dataKey="total" nameKey="label" outerRadius={100} paddingAngle={2}>
                                    {paymentMethodBreakdown.map((_, index) => (
                                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
