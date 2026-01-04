import { Calendar, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface PostCardProps {
  id: string;
  title: string;
  excerpt: string;
  status:
    | "DRAFT"
    | "SCHEDULED"
    | "PUBLISHED"
    | "draft"
    | "scheduled"
    | "published";
  date: string;
}

export function PostCard({ id, title, excerpt, status, date }: PostCardProps) {
  const statusLabel =
    status === "DRAFT" || status === "draft"
      ? "Sugestão da IA"
      : status === "SCHEDULED" || status === "scheduled"
        ? "Agendado"
        : "Publicado";

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-indigo-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="mb-2 text-xs font-normal">
            {statusLabel}
          </Badge>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />{" "}
            {new Date(date).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <h3 className="font-semibold text-lg leading-tight text-slate-900">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-slate-600 line-clamp-3">{excerpt}</p>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 p-3 flex justify-end gap-2">
        <Button variant="ghost" size="sm" className="text-slate-500">
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <Edit3 className="w-4 h-4 mr-2" /> Editar
        </Button>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
          Postar
        </Button>
      </CardFooter>
    </Card>
  );
}
