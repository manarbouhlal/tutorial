import { Client } from "../../client/model/Client";
import { Game } from "../../game/model/Game";

export class Loan {
  id: number;
  startDate: Date;
  endDate: Date;
  game: Game;
  client: Client;
}


  
