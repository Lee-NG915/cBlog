import React from 'react';
// import { DualBox } from 'components/DualBox';
import { Box, Typography, Stack, Divider } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
// import style from './style.scss';

const BipAndTrain = () => {
  const { desktop } = useBreakpoints();
  const datas = [
    {
      title: 'Technical skills',
      content:
        "Immerse yourself in the relevant tools used within our company. Gain hands-on experience and proficiency in the tools essential for your role, ensuring you're well-equipped for the tasks at hand.",
    },
    {
      title: 'Functional skills',
      content:
        'Elevate your interpersonal skills through modules focused on collaboration and effective teamwork. Learn the art of communication, active listening, and empathy, fostering positive relationships within the team and with external stakeholders.',
    },
    {
      title: 'Leadership skills',
      content:
        'Develop strategic thinking and leadership abilities with modules covering project management, decision-making, and problem-solving, tailored to the specific needs of our company.',
    },
  ];
  return (
    // <DualBox
    //   containerClassName={`${style.BipAndTrain}`}
    //   leftClassName={`${style.BipAndTrain}__left`}
    //   leftComponent={
    //     <>
    //       <div className={`${style.BipAndTrain}__content `}>
    //         <h3>Business Innovation Project</h3>
    //         <div>
    //           <p>
    //             The Business Innovation Project is a growth opportunity that lets you take ownership of projects and
    //             explore your areas of interest.
    //           </p>
    //           <p>
    //             Choose from an existing project within your department or start a completely new one. Graduates can work
    //             on various Business Innovation Projects during the programme. Beyond your regular on-the-job learning,
    //             this is an avenue for you to gain hands-on experience, career guidance and self-development.
    //           </p>
    //         </div>
    //       </div>
    //     </>
    //   }
    //   rightComponent={
    //     <>
    //       <div className={`${style.BipAndTrain}__content ${style.BipAndTrain}__right`}>
    //         <h3>Training Modules</h3>
    //         <div>
    //           <p>
    //             Training Modules are another highlight of the programme, offering you insight and expert advice on a broad
    //             range of topics beyond your own streams.
    //           </p>
    //           <div>
    //             Examples of modules you can look forward to include:
    //             <ol>
    //               <li> Project Management</li>
    //               <li> API 101 and Low-code Development</li>
    //               <li> Facebook/ Google Ads, Google Analytics</li>
    //               <li> Fundamentals of P&L</li>
    //               <li> Analytics with Data Warehouse</li>
    //             </ol>
    //           </div>
    //         </div>
    //       </div>
    //     </>
    //   }
    // />
    //
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="center"
      alignItems="center"
      mt={6}
      sx={{
        borderTop: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
      }}
    >
      {datas.map((data, index) => (
        <React.Fragment key={index}>
          <Stack direction={{ xs: 'column', md: 'row' }}>
            <Box p={6} py={4}>
              <Typography level="h3" mb={2}>
                {data.title}
              </Typography>
              <Typography>{data.content}</Typography>
            </Box>
          </Stack>
          {index !== datas.length - 1 && <Divider orientation={desktop ? 'vertical' : 'horizontal'} />}
        </React.Fragment>
      ))}
    </Stack>
  );
};
export default BipAndTrain;
