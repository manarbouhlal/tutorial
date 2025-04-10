import { Pageable } from "src/app/core/model/page/Pageable";
import { Loan } from "./loan";

export class LoanPage {
  content: Loan[];
  pageable?: Pageable;
  totalElements: number;
  size: number;
  number: number;
}
