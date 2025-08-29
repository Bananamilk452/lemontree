import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function SentimentSelect(props: Parameters<typeof Select>[0]) {
  return (
    <Select {...props}>
      <SelectTrigger>
        <SelectValue placeholder="감정 점수" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">1점 😭</SelectItem>
        <SelectItem value="2">2점 😢</SelectItem>
        <SelectItem value="3">3점 😐</SelectItem>
        <SelectItem value="4">4점 😊</SelectItem>
        <SelectItem value="5">5점 🥰</SelectItem>
      </SelectContent>
    </Select>
  );
}
