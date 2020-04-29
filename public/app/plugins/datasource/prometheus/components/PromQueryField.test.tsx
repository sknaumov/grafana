import { mount } from 'enzyme';
import React from 'react';

import PromQueryField, { groupMetricsByPrefix, RECORDING_RULES_GROUP } from './PromQueryField';
import { DataSourceInstanceSettings } from '@grafana/data';
import { PromOptions } from '../types';
import { ButtonCascader } from '@grafana/ui';

describe('PromQueryField', () => {
  beforeAll(() => {
    // @ts-ignore
    window.getSelection = () => {};
  });

  it('does not render metrics chooser if no language provider exists', () => {
    const queryField = mount(
      <PromQueryField
        // @ts-ignore
        datasource={{}}
        query={{ expr: '', refId: '' }}
        onRunQuery={() => {}}
        onChange={() => {}}
        history={[]}
      />
    );

    expect(queryField.find(ButtonCascader).length).toBe(0);
  });

  it('renders metrics chooser if a language provider exists', () => {
    const datasource = ({
      languageProvider: {
        start: () => Promise.resolve([]),
      },
    } as unknown) as DataSourceInstanceSettings<PromOptions>;

    const queryField = mount(
      <PromQueryField
        // @ts-ignore
        datasource={datasource}
        query={{ expr: '', refId: '' }}
        onRunQuery={() => {}}
        onChange={() => {}}
        history={[]}
      />
    );

    expect(queryField.find(ButtonCascader).length).toBe(1);
  });
});

describe('groupMetricsByPrefix()', () => {
  it('returns an empty group for no metrics', () => {
    expect(groupMetricsByPrefix([])).toEqual([]);
  });

  it('returns options grouped by prefix', () => {
    expect(groupMetricsByPrefix(['foo_metric'])).toMatchObject([
      {
        value: 'foo',
        children: [
          {
            value: 'foo_metric',
          },
        ],
      },
    ]);
  });

  it('returns options grouped by prefix with metadata', () => {
    expect(groupMetricsByPrefix(['foo_metric'], { foo_metric: [{ type: 'TYPE', help: 'my help' }] })).toMatchObject([
      {
        value: 'foo',
        children: [
          {
            value: 'foo_metric',
            title: 'foo_metric\nTYPE\nmy help',
          },
        ],
      },
    ]);
  });

  it('returns options without prefix as toplevel option', () => {
    expect(groupMetricsByPrefix(['metric'])).toMatchObject([
      {
        value: 'metric',
      },
    ]);
  });

  it('returns recording rules grouped separately', () => {
    expect(groupMetricsByPrefix([':foo_metric:'])).toMatchObject([
      {
        value: RECORDING_RULES_GROUP,
        children: [
          {
            value: ':foo_metric:',
          },
        ],
      },
    ]);
  });
});
