CREATE CONSTRAINT ON (product:Product) ASSERT product.id IS UNIQUE;
CREATE CONSTRAINT ON (variant:Variant) ASSERT variant.id IS UNIQUE;
CREATE CONSTRAINT ON (image:Image) ASSERT image.id IS UNIQUE;
CREATE CONSTRAINT ON (option:Option) ASSERT option.id IS UNIQUE;

CREATE INDEX ON :Product(handle);
CREATE INDEX ON :Product(tags);
CREATE INDEX ON :Variant(option1s);