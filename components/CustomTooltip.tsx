import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HiMiniQuestionMarkCircle } from "react-icons/hi2";

const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export default function CustomTooltip({ text }: { text: string }) {
  if (hasTouchScreen) {
    return (
      <Popover>
        <PopoverTrigger aria-label="tooltip for touch screens">
          <HiMiniQuestionMarkCircle />
        </PopoverTrigger>
        <PopoverContent className="dark:border-custom-highlight dark:bg-main-bg-dark max-w-[50%]">
          <p className="font-thin text-sm italic">{text}</p>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="cursor-default" aria-label="tooltip">
          <HiMiniQuestionMarkCircle />
        </TooltipTrigger>
        <TooltipContent className="dark:border-custom-highlight dark:bg-main-bg-dark max-w-[50%]">
          <p className="font-thin text-sm italic">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}