import { Stack, Typography } from '@castlery/fortress';
import LevelCubeLine from '../level-cube-line/level-cube-line';
import InfoButton from '../info-button/info-button';

/* eslint-disable-next-line */
export interface ComfortRatingLineProps {
  highestRating: number;
  name: string;
  currentRating: number;
  lowestWord: string;
  highestWord: string;
  isFirst?: boolean;
  explanation?: string | null;
  onClick?: (explanation: string) => void;
}

export function ComfortRatingLine(props: ComfortRatingLineProps) {
  const { highestRating, name, currentRating, lowestWord, highestWord, isFirst, explanation, onClick } = props;
  const handleClickExplanation = (explanation: string) => {
    onClick && onClick(explanation);
  };
  return (
    <Stack
      sx={[
        {
          border: (theme) => `1px solid ${theme.palette.brand.charcoal[300]}`,
          padding: 1,
        },
        !isFirst && {
          borderTop: 'none',
        },
      ]}
    >
      <Stack
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 1,
        }}
      >
        <Typography
          sx={{
            color: (theme) => theme.palette.brand.charcoal[800],
            textAlign: 'center',
            fontWeight: 600,
            marginRight: explanation ? 2 : 0,
          }}
        >
          {name}
        </Typography>
        {explanation && (
          <InfoButton
            innerStyle={{
              width: '14px',
              height: '14px',
            }}
            tooltipTitle="More Info Here"
            placement="right"
            onClick={() => handleClickExplanation(explanation)}
          />
        )}
      </Stack>
      <Stack
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            color: (theme) => theme.palette.brand.charcoal[500],
            marginRight: 2,
          }}
        >
          {lowestWord}
        </Typography>
        <LevelCubeLine ratingCapacity={highestRating} currentRating={currentRating} />
        <Typography
          sx={{
            fontSize: 12,
            color: (theme) => theme.palette.brand.charcoal[500],
            marginLeft: 2,
          }}
        >
          {highestWord}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default ComfortRatingLine;
