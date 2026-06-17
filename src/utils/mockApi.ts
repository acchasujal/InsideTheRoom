export interface GeneratedPerspective {
  persona: string;
  text: string;
}

export interface LiveGenerationResponse {
  retrievedLaw: string;
  perspectives: GeneratedPerspective[];
}

export const generateLivePerspectives = async (incidentText: string): Promise<LiveGenerationResponse> => {
  // Simulate network delay for the pipeline processing effect (5 seconds)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        retrievedLaw: "Law 12 (Fouls and Misconduct)\n\nIt is an offence if a player acts in a manner that shows a lack of respect for the game.",
        perspectives: [
          {
            persona: "Fan",
            text: "That was clearly intentional! You can't let a player get away with that. It ruins the integrity of the match."
          },
          {
            persona: "Referee",
            text: "Based on my angle, the contact appeared incidental. I have to manage the game flow and not penalize every slight touch."
          },
          {
            persona: "VAR",
            text: "Reviewing the footage, the player's movement deviates from a natural running motion just before contact. This warrants a review."
          },
          {
            persona: "Rulebook",
            text: "A player who acts with disregard to the danger to, or consequences for, an opponent must be cautioned."
          }
        ]
      });
    }, 5000);
  });
};
