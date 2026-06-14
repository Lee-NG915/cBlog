import React from 'react';
import CareersEntry from 'client/CareersEntry';
import GraduateEntry from 'client/CareersEntry/Graduate';
import HtmlEngine from 'server/utils/HtmlEngine';

export const renderJobBoard =
  ({ namespace }) =>
  (req, res) => {
    const engine = new HtmlEngine({ entry: 'careers', namespace });
    res.send(
      engine.render(
        <CareersEntry
          appContext={{
            device: req.device,
          }}
        />
      )
    );
  };

export const renderJobDetail =
  ({ namespace }) =>
  (req, res) => {
    const engine = new HtmlEngine({ entry: 'careers', namespace });
    res.send(
      engine.render(
        <CareersEntry
          isDetail
          appContext={{
            device: req.device,
          }}
        />
      )
    );
  };

export const renderGraduateProgrammePage =
  ({ namespace }) =>
  (req, res) => {
    const engine = new HtmlEngine({ entry: 'careers', namespace });
    res.send(
      engine.render(
        <GraduateEntry
          appContext={{
            device: req.device,
          }}
        />
      )
    );
  };
