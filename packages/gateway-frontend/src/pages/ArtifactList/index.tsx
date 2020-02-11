import React from 'react';
import useSWR from 'swr';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import { ArtifactConfig } from 'surgio/build/types';

import { defaultFetcher } from '../../libs/utils';
import ArtifactCard from '../../components/ArtifactCard';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    ArtifactListPage: {},
    headerContainer: {
      padding: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    categories: {
      margin: theme.spacing(2, 0, 0),
    },
    category: {},
    listContainer: {},
    listItem: {
      marginBottom: theme.spacing(4),
    },
  }),
);

const Page: React.FC = () => {
  const classes = useStyles();
  const { data: artifactList, error } = useSWR<ReadonlyArray<ArtifactConfig>>(
    '/api/artifacts',
    defaultFetcher,
  );
  const [categorySelection, setCategorySelection] = React.useState<{[key: string]: boolean}>({});
  const [categories, setCategories] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (artifactList) {
      const result = artifactList
        .reduce<string[]>(
          (accu, curr): string[] => {
            if (Array.isArray(curr?.categories)) {
              accu.push(...curr.categories);
            }
            return accu;
          },
          []
        )
        .filter((item, index, arr) => {
          const find = arr.findIndex(i => i === item);
          return index === find;
        });

      result.forEach(cat => {
        setCategorySelection(prevVal => {
          return {
            ...prevVal,
            [cat]: false,
          };
        });
      });

      setCategories(result);
    }
  }, [artifactList]);

  if (error) {
    return <div>Failed to load</div>;
  }

  if (!artifactList) {
    return <div>Loading...</div>;
  }

  const handleCategoryChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategorySelection({ ...categorySelection, [name]: event.target.checked });
  };

  const getArtifactListElement = () => {
    if (!artifactList) return null;

    let result: JSX.Element[] = [];
    const hasSelection = Object.keys(categorySelection).some(key => categorySelection[key]);

    if (!hasSelection) {
      return artifactList.map(item => {
        return (
          <div className={classes.listItem} key={item.name}>
            <ArtifactCard artifact={item} />
          </div>
        );
      });
    }

    Object.keys(categorySelection).forEach(item => {
      if (categorySelection[item]) {
        result.push(
          ...artifactList
            .filter(artifact => {
              return artifact?.categories?.includes(item);
            })
            .map(artifact => {
              return (
                <div className={classes.listItem} key={artifact.name}>
                  <ArtifactCard artifact={artifact} />
                </div>
              );
            })
        );
      }
    });

    return <>{ result }</>;
  };

  return (
    <div className={classes.ArtifactListPage}>
      <Paper className={classes.headerContainer}>
        <Typography gutterBottom variant="h4">Artifacts</Typography>
        {
          categories.length && (
            <>
              <Divider />
              <div className={classes.categories}>
                <Typography gutterBottom variant="body1">分类</Typography>
                <FormGroup row>
                  {
                    categories.map(cat => (
                      <FormControlLabel
                        className={classes.category}
                        key={cat}
                        control={
                          <Checkbox
                            checked={categorySelection[cat]}
                            onChange={handleCategoryChange(cat)}
                            value={cat}
                            color="primary"
                          />
                        }
                        label={cat}
                      />
                    ))
                  }
                </FormGroup>
              </div>
            </>
          )
        }
      </Paper>
      <div className={classes.listContainer}>
        { getArtifactListElement() }
      </div>
    </div>
  );
};

export default Page;
