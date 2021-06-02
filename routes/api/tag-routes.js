const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// find all tags
router.get('/', async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      include: [{all: true}],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// finds a single tag by its `id`
router.get('/:id', async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{all: true}],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// creates a new tag
router.post('/', (req, res) => {
  Tag.create(req.body)
    .then((tag) => {
      if (req.body.productIds.length) {
        const tagProductIdsArr = req.body.productIds.map((product_id) => {
          return {
            tag_id: tag.id,
            product_id
          };
        });
        return ProductTag.bulkCreate(tagProductIdsArr);
      }
      res.status(200).json(tag);
    })
    .then((tagProductId) => res.status(200).json(tagProductId))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// updates a tag's name by its `id` value
router.put('/:id', (req, res) => {
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
      return ProductTag.findAll({where: { tag_id: req.params.id }});
    })
    .then((productTags) => {
      const productTagIds = ProductTags.map(({ product_id }) => product_id);
      const newProductTags = req.body.productIds
      .filter((product_id) => !productTagIds.includes(product_id))
      .map((product_id) => {
        return {
          tag_id: req.params.id,
          product_id,
        };
      });
      const productTagsToRemove = productTags
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);
      return Promise.all([
        ProductTag.destroy({where: {id: productTagsToRemove }}),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// deletes on tag by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!tagData) {
      res.status(404).json({ message: 'No tag found with that ID.' });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;